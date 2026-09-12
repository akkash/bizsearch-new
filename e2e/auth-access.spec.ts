import { test, expect } from '@playwright/test';
import { ACCOUNTS } from './helpers/env';
import { expectLoginRedirect, login } from './helpers/auth';

test.describe('Auth and access control', () => {
  test('login and signup pages render', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome Back').first()).toBeVisible();
    await page.goto('/signup');
    await expect(page.getByText(/Create|Sign up|account/i).first()).toBeVisible();
    await page.goto('/forgot-password');
    await expect(page.locator('#email, input[type="email"]').first()).toBeVisible();
  });

  test('invalid password stays on login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(ACCOUNTS.franchisee);
    await page.locator('#password').fill('WrongPass999!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText(/invalid|wrong|error|credentials/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/login/);
  });

  test('valid franchisee login reaches the app', async ({ page }) => {
    await login(page, ACCOUNTS.franchisee);
    await expect(page).not.toHaveURL(/\/login/);
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Dashboard|Franchise Growth/ })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('protected routes redirect guests to login', async ({ page }) => {
    await expectLoginRedirect(page, '/dashboard');
    await expectLoginRedirect(page, '/my-enquiries');
    await expectLoginRedirect(page, '/pipeline');
    await expectLoginRedirect(page, '/messages');
    await expectLoginRedirect(page, '/saved');
    await expectLoginRedirect(page, '/admin');
  });

  test('password field is required', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(ACCOUNTS.franchisee);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
