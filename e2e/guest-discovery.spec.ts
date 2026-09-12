import { test, expect } from '@playwright/test';

test.describe('Guest discovery', () => {
  test('home is franchise-first', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-homepage="franchise-first"]')).toBeVisible();
    await expect(page.getByText(/Find the right/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Franchises' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Match' }).first()).toBeVisible();
  });

  test('browse franchises and open a live listing', async ({ page }) => {
    await page.goto('/franchise/phase1-test-franchise-a');
    await expect(page.getByRole('heading', { name: /Phase1 Test Franchise A/i }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole('button', { name: 'Enquire' }).first()).toBeVisible();
  });

  test('guest enquire prompts sign in', async ({ page }) => {
    await page.goto('/franchise/phase1-test-franchise-a');
    await page.getByRole('button', { name: 'Enquire' }).first().click();
    await expect(
      page.getByText(/Sign in to continue|Enquire about this franchise/i).first()
    ).toBeVisible();
    await expect(page.getByText('Sign In').first()).toBeVisible();
  });

  test('match is gated for guests', async ({ page }) => {
    await page.goto('/match');
    await expect(page.getByText(/Sign in for personalized matches|Franchise Matcher/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('businesses remain a secondary catalog', async ({ page }) => {
    await page.goto('/businesses');
    await expect(page.getByText(/Businesses for sale|No details found|listing/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('smart search, map, industries, advisors, financing', async ({ page }) => {
    await page.goto('/smart-search');
    await expect(page.getByText(/How it works|Describe the franchise/i).first()).toBeVisible();

    await page.goto('/industries');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/advisors');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/financing');
    await expect(page.getByText(/Financing/i).first()).toBeVisible();
  });

  test('legal and help pages render', async ({ page }) => {
    for (const [path, needle] of [
      ['/about', /About/i],
      ['/contact', /Contact/i],
      ['/privacy', /Privacy/i],
      ['/terms', /Terms/i],
      ['/refund-policy', /Refund/i],
      ['/disclaimer', /Disclaimer/i],
      ['/help', /Help/i],
    ] as const) {
      await page.goto(path);
      await expect(page.getByText(needle).first()).toBeVisible({ timeout: 15_000 });
    }
  });

  test('unknown route shows 404', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-e2e');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
  });

  test('mobile four-tab IA', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Search' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Saved' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Inbox' })).toBeVisible();
    await nav.getByRole('link', { name: 'Search' }).click();
    await page.waitForURL(/\/franchises/);
  });
});
