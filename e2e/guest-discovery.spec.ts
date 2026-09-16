import { test, expect } from '@playwright/test';
import { isProdE2E } from './helpers/env';

test.describe('Guest discovery', () => {
  test('home is franchise-first', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-homepage="franchise-first"]')).toBeVisible();
    await expect(page.getByText(/Find the right/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Franchises' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Match' }).first()).toBeVisible();
  });

  test('franchise catalog renders', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/franchises');
    await expect(page.getByRole('heading', { name: /Franchise/i }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator('body')).not.toHaveText(/^\s*$/);
    expect(errors, `page errors: ${errors.join(' | ')}`).toEqual([]);
  });

  test('listing HTML has a unique title before JS', async ({ request }) => {
    test.skip(!isProdE2E(), 'Edge prerender runs on Vercel');
    const res = await request.get('/franchise/snow-cube');
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/<title>[^<]*SNOW CUBE[^<]*<\/title>/i);
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/www\.bizsearch\.in\/franchise\/snow-cube"/i);
    expect(html).toContain('application/ld+json');
    expect(html).toContain('id="root"');
  });

  test('catalog and docs HTML have unique titles before JS', async ({ request }) => {
    test.skip(!isProdE2E(), 'Edge prerender runs on Vercel');
    for (const [path, needle] of [
      ['/franchises', /Franchise opportunities in India/i],
      ['/businesses', /Businesses for sale in India/i],
      ['/docs', /BizSearch API/i],
      ['/about', /About BizSearch/i],
      ['/contact', /Contact BizSearch/i],
    ] as const) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      expect(html, path).toMatch(new RegExp(`<title>[^<]*${needle.source}[^<]*</title>`, 'i'));
      expect(html, path).toMatch(
        new RegExp(`<link rel="canonical" href="https://www\\.bizsearch\\.in${path}"`, 'i')
      );
    }
  });

  test('/api/docs redirects to /docs', async ({ request }) => {
    test.skip(!isProdE2E(), 'Vercel redirects run on production');
    const res = await request.get('/api/docs', { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()['location'] || '').toMatch(/\/docs\/?$/);
  });

  test('empty advisors and map URLs redirect to franchises', async ({ request }) => {
    test.skip(!isProdE2E(), 'Vercel redirects run on production');
    for (const path of ['/advisors', '/franchise-map']) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect([301, 302, 307, 308], path).toContain(res.status());
      expect(res.headers()['location'] || '', path).toMatch(/\/franchises\/?$/);
    }
  });

  test('unknown path is an HTTP 404 with noindex', async ({ request }) => {
    test.skip(!isProdE2E(), 'Edge soft-404 runs on Vercel');
    const res = await request.get('/this-route-does-not-exist-e2e');
    expect(res.status()).toBe(404);
    const html = await res.text();
    expect(html).toMatch(/noindex/i);
    expect(html).toMatch(/<title>[^<]*not found[^<]*<\/title>/i);
  });

  test('browse franchises and open a live listing', async ({ page }) => {
    test.skip(isProdE2E(), 'Test listings are unpublished on production');
    await page.goto('/franchise/phase1-test-franchise-a');
    await expect(page.getByRole('heading', { name: /Phase1 Test Franchise A/i }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole('button', { name: 'Enquire' }).first()).toBeVisible();
  });

  test('guest enquire prompts sign in', async ({ page }) => {
    test.skip(isProdE2E(), 'Test listings are unpublished on production');
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
    await expect(page).toHaveURL(/\/franchises/);

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

  test('HTML origin does not send public CORS *', async ({ request }) => {
    test.skip(!isProdE2E(), 'Production header check');
    const res = await request.get('/');
    expect(res.headers()['access-control-allow-origin']).not.toBe('*');
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
