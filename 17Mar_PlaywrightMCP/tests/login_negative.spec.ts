import { test, expect } from '@playwright/test';

const BASE_URL = 'https://app.vwo.com/#/login';

// Helper: wait for login form to be ready
async function goToLogin(page: any) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  // Wait for the Sign In button to be present by its stable ID
  await page.waitForSelector('#js-login-btn', { timeout: 60000 });
}

// ─── TC-N001: Invalid Email Format ──────────────────────────────────────────
test('TC-N001: Login fails with invalid email format', async ({ page }) => {
  await goToLogin(page);

  await page.getByRole('textbox', { name: 'Email address' }).fill('invalid_email_format');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password123!');
  await page.locator('#js-login-btn').click();
  await page.waitForTimeout(2000);

  // VWO shows "Required field" for invalid/missing email
  const errorText = await page.locator('[class*="error"]').allInnerTexts();
  const hasRequiredFieldError = errorText.some((t: string) => t.includes('Required field'));

  expect(hasRequiredFieldError, `Expected a "Required field" validation error. Got: ${JSON.stringify(errorText)}`).toBeTruthy();

  // Page should remain on login
  expect(page.url()).toContain('login');
});

// ─── TC-N002: Empty Email Field ──────────────────────────────────────────────
test('TC-N002: Login fails when email field is empty', async ({ page }) => {
  await goToLogin(page);

  // Leave email blank, fill password
  await page.getByRole('textbox', { name: 'Password' }).fill('Password123!');
  await page.locator('#js-login-btn').click();
  await page.waitForTimeout(2000);

  const errorText = await page.locator('[class*="error"]').allInnerTexts();
  const hasError = errorText.some((t: string) => t.includes('Required field') || t.trim() !== '');

  expect(hasError, `Expected a validation error for empty email. Got: ${JSON.stringify(errorText)}`).toBeTruthy();
  expect(page.url()).toContain('login');
});

// ─── TC-N003: Empty Password Field ──────────────────────────────────────────
test('TC-N003: Login fails when password field is empty', async ({ page }) => {
  await goToLogin(page);

  await page.getByRole('textbox', { name: 'Email address' }).fill('test.user@example.com');
  // Leave password blank
  await page.locator('#js-login-btn').click();
  await page.waitForTimeout(2000);

  const errorText = await page.locator('[class*="error"]').allInnerTexts();
  const hasError = errorText.some((t: string) => t.includes('Required field') || t.trim() !== '');

  expect(hasError, `Expected a validation error for empty password. Got: ${JSON.stringify(errorText)}`).toBeTruthy();
  expect(page.url()).toContain('login');
});

// ─── TC-N004: Incorrect Password Credentials ────────────────────────────────
test('TC-N004: Login fails with valid email but incorrect password', async ({ page }) => {
  await goToLogin(page);

  await page.getByRole('textbox', { name: 'Email address' }).fill('automation.test.vwo@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('IncorrectPass!123');
  await page.locator('#js-login-btn').click();

  // VWO shows a notification — wait for it
  await page.waitForSelector('[class*="notification"]', { timeout: 15000 });
  const notifications = await page.locator('[class*="notification"]').allInnerTexts();
  const hasCredentialError = notifications.some((t: string) =>
    t.toLowerCase().includes('did not match') ||
    t.toLowerCase().includes('invalid') ||
    t.toLowerCase().includes('incorrect')
  );

  expect(
    hasCredentialError,
    `Expected credentials mismatch notification. Got: ${JSON.stringify(notifications)}`
  ).toBeTruthy();
  expect(page.url()).toContain('login');
});

// ─── TC-N005: Password Contains Only Spaces ──────────────────────────────────
test('TC-N005: Login fails when password contains only spaces', async ({ page }) => {
  await goToLogin(page);

  await page.getByRole('textbox', { name: 'Email address' }).fill('test.user@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('       ');
  await page.locator('#js-login-btn').click();
  await page.waitForTimeout(2000);

  const errorText = await page.locator('[class*="error"]').allInnerTexts();
  const notifications = await page.locator('[class*="notification"]').allInnerTexts();
  const allMessages = [...errorText, ...notifications];

  const hasError = allMessages.some((t: string) =>
    t.includes('Required field') ||
    t.toLowerCase().includes('invalid') ||
    t.toLowerCase().includes('did not match') ||
    t.trim() !== ''
  );

  expect(hasError, `Expected validation error for space-only password. Got: ${JSON.stringify(allMessages)}`).toBeTruthy();
  expect(page.url()).toContain('login');
});
