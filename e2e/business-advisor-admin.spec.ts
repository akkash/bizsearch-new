import { test, expect } from '@playwright/test';
import { ACCOUNTS } from './helpers/env';
import { expectAccessDenied, login } from './helpers/auth';

test.describe('Buyer and seller secondary journeys', () => {
  test('buyer can open enquiries and is blocked from pipeline', async ({ page }) => {
    await login(page, ACCOUNTS.buyer);
    await page.goto('/my-enquiries');
    await expect(page.getByRole('heading', { name: 'My Enquiries' })).toBeVisible({
      timeout: 15_000,
    });
    await page.goto('/businesses');
    await expect(page.getByText(/Businesses for sale|No details found|listing/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expectAccessDenied(page, '/pipeline');
    await expectAccessDenied(page, '/add-franchise-listing');
  });

  test('seller can open listing tools and is blocked from franchisee apps', async ({ page }) => {
    await login(page, ACCOUNTS.seller);
    await page.goto('/add-business-listing');
    await expect(page.locator('body')).toBeVisible();
    await page.goto('/seller-analytics');
    await expect(page.locator('body')).toBeVisible();
    await page.goto('/business-valuation');
    await expect(page.getByText(/Valuation|valu/i).first()).toBeVisible({ timeout: 15_000 });
    await expectAccessDenied(page, '/my-applications');
    await expectAccessDenied(page, '/add-franchise-listing');
  });
});

test.describe('Advisor legacy CRM', () => {
  test('deprecated advisor workspace still loads', async ({ page }) => {
    await login(page, ACCOUNTS.advisor);
    await page.goto('/advisor/dashboard');
    await expect(page.getByText(/deprecated|Legacy CRM|Advisor/i).first()).toBeVisible({
      timeout: 20_000,
    });

    await page.goto('/clients');
    await expect(page.getByText(/deprecated|Client Management/i).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.goto('/deal-pipeline');
    await expect(page.getByText(/deprecated|Deal Pipeline/i).first()).toBeVisible();

    await page.goto('/commissions');
    await expect(page.getByText(/deprecated|Commission/i).first()).toBeVisible();

    await expectAccessDenied(page, '/add-franchise-listing');
    await expectAccessDenied(page, '/my-applications');
  });
});

test.describe('Admin journeys', () => {
  test('guest is sent to login for /admin', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/admin');
    await page.waitForURL(/\/login/, { timeout: 15_000 });
  });

  test('non-admin cannot open /admin', async ({ page }) => {
    await login(page, ACCOUNTS.franchisee);
    await page.goto('/admin');
    await expect(page.getByText(/Access Denied|permission|Admin/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
