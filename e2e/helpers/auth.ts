import { expect, type Page } from '@playwright/test';
import { PASSWORD } from './env';

export async function login(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20_000 });
  if (page.url().includes('/onboarding')) {
    const skip = page.getByRole('button', { name: /Skip/i }).first();
    if (await skip.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await skip.click();
      await page.waitForTimeout(500);
    }
    if (page.url().includes('/onboarding')) {
      throw new Error(`${email} was sent to onboarding — profile phone/city/state missing`);
    }
  }
}

export async function expectAccessDenied(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByText('Access Denied').first()).toBeVisible({
    timeout: 20_000,
  });
}

export async function expectLoginRedirect(page: Page, path: string) {
  await page.context().clearCookies();
  await page.goto(path);
  await page.evaluate(() => localStorage.clear());
  await page.goto(path);
  await page.waitForURL(/\/login/, { timeout: 15_000 });
}

export async function chooseSelect(page: Page, placeholder: string, option: string) {
  await page.locator('[role="combobox"]').filter({ hasText: placeholder }).first().click();
  await page.getByRole('option', { name: option }).click();
}
