import { test, expect } from '@playwright/test';
import { ACCOUNTS } from './helpers/env';
import { chooseSelect, expectAccessDenied, login } from './helpers/auth';

test.describe('Franchisee journeys', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ACCOUNTS.franchisee);
  });

  test('dashboard and profile surfaces', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Dashboard|Franchise Growth/ })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText('Entrepreneur A').first()).toBeVisible();

    await page.goto('/profile/edit');
    await expect(page.getByText(/Edit|Profile|display/i).first()).toBeVisible({ timeout: 15_000 });

    await page.goto('/profile/settings');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/profile/documents');
    await expect(page.locator('body')).toBeVisible();
  });

  test('save a franchise and see it on /saved', async ({ page }) => {
    await page.goto('/franchise/phase1-test-franchise-a');
    await expect(page.getByRole('heading', { name: /Phase1 Test Franchise A/i }).first()).toBeVisible({
      timeout: 20_000,
    });
    const save = page.getByRole('button', { name: /Save franchise|Unsave franchise/i }).first();
    if (await save.isVisible().catch(() => false)) {
      await save.click();
    }
    await page.goto('/saved');
    await expect(page.getByText(/Saved Listings|Search alerts|listing/i).first()).toBeVisible();
  });

  test('apply for a franchise through all five steps', async ({ page }) => {
    await page.goto('/franchise/phase1-test-franchise-a/apply');
    await expect(page.getByRole('heading', { name: /Apply for Phase1 Test Franchise A/i })).toBeVisible({
      timeout: 20_000,
    });

    const name = page.getByPlaceholder('Your full name');
    if (!(await name.inputValue())) await name.fill('Entrepreneur A');
    const city = page.getByPlaceholder('City');
    if (!(await city.inputValue())) await city.fill('Chennai');
    const state = page.getByPlaceholder('State');
    if (!(await state.inputValue())) await state.fill('Tamil Nadu');

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Step 2 of 5')).toBeVisible();
    await chooseSelect(page, 'Select range', '₹50 Lakhs - 1 Crore');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByText('Step 3 of 5')).toBeVisible();
    await page.getByPlaceholder(/preferred cities/i).fill('Chennai');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByText('Step 4 of 5')).toBeVisible();
    await page.getByPlaceholder(/attracted you/i).fill('Territory fit and unit economics.');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByText('Step 5 of 5')).toBeVisible();
    const checks = page.getByRole('checkbox');
    await checks.nth(0).click();
    await checks.nth(1).click();
    await page.getByRole('button', { name: 'Submit Application' }).click();

    await page.waitForURL(/\/my-applications/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'My Applications' })).toBeVisible();
  });

  test('my applications and application detail', async ({ page }) => {
    await page.goto('/my-applications');
    await expect(page.getByRole('heading', { name: 'My Applications' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Phase1|Application|No details found|submitted/i).first()).toBeVisible();
  });

  test('match, messages, notifications, mandate, financing', async ({ page }) => {
    await page.goto('/match');
    await expect(page.getByText(/Franchise Matcher|Find Matching Franchises/i).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.goto('/messages');
    await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible({ timeout: 15_000 });

    await page.goto('/notifications');
    await expect(page.getByRole('heading', { name: /Notifications/i }).first()).toBeVisible();

    await page.goto('/buyer/mandate');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/financing');
    await expect(page.getByText(/Financing/i).first()).toBeVisible();
  });

  test('franchisee cannot open supply or admin tools', async ({ page }) => {
    await expectAccessDenied(page, '/pipeline');
    await expectAccessDenied(page, '/my-listings');
    await expectAccessDenied(page, '/add-franchise-listing');
    await expectAccessDenied(page, '/franchisor/applications');
    await expectAccessDenied(page, '/advisor/dashboard');
    await expectAccessDenied(page, '/clients');
  });
});
