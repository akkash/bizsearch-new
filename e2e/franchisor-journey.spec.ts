import { test, expect } from '@playwright/test';
import { ACCOUNTS } from './helpers/env';
import { expectAccessDenied, login } from './helpers/auth';

test.describe('Franchisor journeys', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ACCOUNTS.franchisor);
  });

  test('growth dashboard and my listings', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Franchise Growth|Dashboard/ })).toBeVisible({
      timeout: 20_000,
    });

    await page.goto('/my-listings');
    await expect(page.getByRole('heading', { name: 'My Listings' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Phase1 Test Franchise A|No details found/i).first()).toBeVisible();
  });

  test('list-franchise entry and submitted status page', async ({ page }) => {
    await page.goto('/add-franchise-listing');
    await expect(page.getByRole('heading', { name: /List Your/i })).toBeVisible({ timeout: 15_000 });

    await page.goto('/franchise/edit/phase1-test-franchise-a');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/listing-submitted');
    await expect(page.getByRole('heading', { name: /Listing submitted/i })).toBeVisible();
  });

  test('pipeline, applications, and leads alias', async ({ page }) => {
    await page.goto('/pipeline');
    await expect(page.getByText(/pipeline|lead|Entrepreneur|No leads/i).first()).toBeVisible({
      timeout: 20_000,
    });

    await page.goto('/leads');
    await expect(page.getByText(/pipeline|lead|Entrepreneur|No leads/i).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.goto('/franchisor/applications');
    await expect(page.getByText(/Franchise Applications|No Applications/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('franchisor cannot open franchisee-only tools', async ({ page }) => {
    await expectAccessDenied(page, '/my-enquiries');
    await expectAccessDenied(page, '/my-applications');
    await expectAccessDenied(page, '/buyer/mandate');
    await expectAccessDenied(page, '/advisor/dashboard');
  });
});
