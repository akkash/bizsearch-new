import { test, expect } from '@playwright/test';
import { ACCOUNTS, adminClient, readIds } from './helpers/env';
import { chooseSelect, login } from './helpers/auth';

const ALERT_SLUG = `p1-alert-${Date.now()}`;
const ALERT_BRAND = `P1 Alert ${ALERT_SLUG.slice(-6)}`;

test.describe.configure({ mode: 'serial' });

test.describe('P1 marketplace loop', () => {
  test('franchisee enquire with five fields → My Enquiries → messages', async ({ page }) => {
    const ids = readIds();
    await adminClient()
      .from('inquiries')
      .update({ status: 'lost' })
      .eq('sender_id', ids.franchiseeId)
      .eq('listing_id', ids.franchiseAId)
      .neq('status', 'lost');

    await login(page, ACCOUNTS.franchisee);
    await page.goto('/franchise/phase1-test-franchise-a');
    await expect(page.getByRole('heading', { name: /Phase1 Test Franchise A/i }).first()).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole('button', { name: 'Enquire' }).first().click();
    await expect(page.getByText('Qualified franchise enquiry')).toBeVisible();

    await chooseSelect(page, 'Select investment capacity', '₹50L–1Cr');
    await page.locator('#preferredLocation').fill('Chennai, Tamil Nadu');
    await chooseSelect(page, 'Select timeline', '1–3 months');
    await chooseSelect(page, 'Funding status', 'Yes — funds ready');
    await chooseSelect(page, 'Select experience', 'Owned/operated a business');
    await page.locator('#message').fill('Playwright P1 qualified enquiry — ready to review FDD.');
    await page.getByRole('button', { name: 'Submit qualified enquiry' }).click();

    await page.waitForURL(/\/my-enquiries/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'My Enquiries' })).toBeVisible();
    await expect(page.getByText('Phase1 Test Franchise A').first()).toBeVisible();
    await expect(page.getByText('Preferred location: Chennai, Tamil Nadu').first()).toBeVisible();

    await page.getByRole('link', { name: 'Open messages' }).first().click();
    await page.waitForURL(/\/messages/);
    await expect(page.getByPlaceholder('Type a message...')).toBeVisible({ timeout: 15_000 });
  });

  test('franchisor pipeline → candidate → schedule meeting → My Enquiries', async ({ page }) => {
    await login(page, ACCOUNTS.franchisor);
    await page.goto('/pipeline');
    await expect(page.getByText('Entrepreneur A').first()).toBeVisible({ timeout: 20_000 });

    await page.getByRole('link', { name: 'Candidate' }).first().click();
    await page.waitForURL(/\/pipeline\/candidate\//);
    await expect(page.getByText('₹50L–1Cr')).toBeVisible();
    await expect(page.getByText('Chennai, Tamil Nadu')).toBeVisible();
    await expect(page.getByText('Yes — funds ready')).toBeVisible();

    await page.locator('#meetingAt').fill('2026-09-20T15:30');
    await page.locator('#meetingNotes').fill('Zoom link will be sent in messages. Agenda: territory + investment.');
    await page.getByRole('button', { name: 'Save meeting' }).click();
    await expect(page.getByText(/Meeting scheduled|Scheduled/i).first()).toBeVisible();

    await login(page, ACCOUNTS.franchisee);
    await page.goto('/my-enquiries');
    await expect(page.getByText('Phase1 Test Franchise A').first()).toBeVisible();
    await expect(page.getByText(/Meeting:/).first()).toBeVisible();
    await expect(page.getByText(/Zoom link will be sent/).first()).toBeVisible();
  });

  test('search Best Match + Alert me → /saved search alerts', async ({ page }) => {
    await login(page, ACCOUNTS.franchisee);
    await page.goto('/franchises?city=Chennai');
    await expect(page.getByText(/Opportunit/i).first()).toBeVisible({ timeout: 20_000 });

    const sort = page.locator('button').filter({ hasText: /Best Match|Newest|Investment/i }).first();
    await expect(sort).toBeVisible();

    await page.getByRole('button', { name: 'Alert me' }).click();
    await expect(page.getByText(/Search saved|already/i)).toBeVisible({ timeout: 15_000 });

    await page.goto('/saved');
    await expect(page.getByRole('heading', { name: 'Search alerts' })).toBeVisible();
    await expect(page.getByText('Chennai').first()).toBeVisible();
  });

  test('new active franchise notifies the saved search', async ({ page }) => {
    const ids = readIds();
    const admin = adminClient();
    const { data: created, error } = await admin
      .from('franchises')
      .insert({
        franchisor_id: ids.franchisorId,
        brand_name: ALERT_BRAND,
        slug: ALERT_SLUG,
        industry: 'Food & Beverage',
        description: 'Playwright saved-search notify target',
        franchise_fee: 400000,
        total_investment_min: 1200000,
        total_investment_max: 2500000,
        status: 'active',
        verification_status: 'verified',
        contact_email: `contact+${ALERT_SLUG}@test.example`,
        headquarters_city: 'Chennai',
        headquarters_state: 'Tamil Nadu',
      })
      .select('id')
      .single();
    if (error) throw new Error(`Insert alert franchise: ${error.message}`);

    await expect
      .poll(
        async () => {
          const { data } = await admin
            .from('notifications')
            .select('id')
            .eq('user_id', ids.franchiseeId)
            .eq('type', 'saved_listing_update')
            .ilike('message', `%${ALERT_BRAND}%`)
            .limit(1);
          return data?.length ?? 0;
        },
        { timeout: 20_000 }
      )
      .toBeGreaterThan(0);

    await login(page, ACCOUNTS.franchisee);
    await page.goto('/notifications');
    await expect(page.getByText(/New match for|matches a search you saved/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(new RegExp(ALERT_BRAND)).first()).toBeVisible();

    await admin.from('franchises').update({ status: 'inactive' }).eq('id', created.id);
  });
});
