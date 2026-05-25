import { test, expect, type Page } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function login(page: Page, email = 'alice@acme.com', password = 'password123') {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

// ─── Auth flow ────────────────────────────────────────────────────────────────

test.describe('authentication', () => {
  test('landing page is publicly accessible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Where the frontend/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
  });

  test('unauthenticated user is redirected to login from /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@email.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('successful login redirects to /dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  });

  test('authenticated user is redirected away from /login', async ({ page }) => {
    await login(page);
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard');
  });
});

// ─── Dashboard navigation ─────────────────────────────────────────────────────

test.describe('dashboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('sidebar shows workspace name', async ({ page }) => {
    await expect(page.getByText('Acme Engineering')).toBeVisible();
  });

  test('navigates to /dashboard/projects', async ({ page }) => {
    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL('/dashboard/projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  });

  test('navigates to /dashboard/builds', async ({ page }) => {
    await page.getByRole('link', { name: 'Builds' }).click();
    await expect(page).toHaveURL('/dashboard/builds');
    await expect(page.getByRole('heading', { name: 'CI Builds' })).toBeVisible();
  });

  test('navigates to /dashboard/members', async ({ page }) => {
    await page.getByRole('link', { name: 'Members' }).click();
    await expect(page).toHaveURL('/dashboard/members');
  });

  test('navigates to /dashboard/settings', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/dashboard/settings');
  });

  test('sign out redirects to /login', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL('/login');
  });
});

// ─── Overview dashboard ───────────────────────────────────────────────────────

test.describe('overview dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows stats cards after streaming resolves', async ({ page }) => {
    // Stats stream in via Suspense — wait for them
    await expect(page.getByText('Active Projects')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Team Members')).toBeVisible();
    await expect(page.getByText('Total Builds')).toBeVisible();
    await expect(page.getByText('Build Success')).toBeVisible();
  });

  test('shows recent builds section', async ({ page }) => {
    await expect(page.getByText('Recent Builds')).toBeVisible({ timeout: 10_000 });
  });

  test('shows active projects section', async ({ page }) => {
    await expect(page.getByText('Active Projects')).toBeVisible({ timeout: 10_000 });
  });
});
