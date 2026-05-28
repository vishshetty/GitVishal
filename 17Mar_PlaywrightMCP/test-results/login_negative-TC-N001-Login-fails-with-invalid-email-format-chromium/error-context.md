# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login_negative.spec.ts >> TC-N001: Login fails with invalid email format
- Location: tests\login_negative.spec.ts:13:5

# Error details

```
TypeError: Cannot read properties of undefined (reading 'includes')
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main "Application main content" [ref=e3]:
    - generic [ref=e7]:
      - generic [ref=e10]:
        - img "VWO" [ref=e12]
        - generic [ref=e13]:
          - img [ref=e15]
          - generic [ref=e18]: Your email, password, IP address or location did not match
        - list [ref=e21]:
          - listitem [ref=e22]:
            - textbox "Email address" [ref=e24]:
              - /placeholder: Enter email ID
              - text: invalid_email_format
          - listitem [ref=e25]:
            - generic [ref=e26]:
              - textbox "Password" [ref=e27]:
                - /placeholder: Enter password
              - button "Toggle password visibility" [ref=e28] [cursor=pointer]:
                - img [ref=e29]
          - listitem [ref=e31]:
            - button "Forgot Password?" [ref=e32] [cursor=pointer]
          - listitem [ref=e33]:
            - generic [ref=e35] [cursor=pointer]:
              - generic [ref=e36]: Remember me
              - img [ref=e38]
          - listitem [ref=e40]:
            - button "Sign in" [active] [ref=e41] [cursor=pointer]:
              - generic [ref=e42]: Sign in
          - listitem [ref=e43]:
            - heading "Or" [level=6] [ref=e45]
          - listitem [ref=e47]:
            - button "Sign in with Google" [ref=e49] [cursor=pointer]:
              - generic [ref=e50]:
                - img [ref=e51]
                - generic [ref=e53]: Sign in with Google
          - listitem [ref=e55]:
            - button "Sign in using SSO" [ref=e56] [cursor=pointer]:
              - img [ref=e57]
              - generic [ref=e59]: Sign in using SSO
          - listitem [ref=e60]:
            - button "Sign in with Passkey" [ref=e61] [cursor=pointer]:
              - img [ref=e62]
              - generic [ref=e64]: Sign in with Passkey
          - listitem [ref=e65]:
            - generic [ref=e67]: New to VWO?
          - listitem [ref=e69]:
            - link "Start a FREE TRIAL" [ref=e70] [cursor=pointer]:
              - /url: https://vwo.com/free-trial/?utm_medium=website&utm_source=login-page&utm_campaign=mof_eg_loginpage
              - generic [ref=e71]: Start a FREE TRIAL
          - listitem [ref=e72]:
            - text: By continuing, you agree to VWO's
            - link "Privacy policy" [ref=e73] [cursor=pointer]:
              - /url: https://vwo.com/privacy-policy/?utm_medium=app&utm_source=login-page&utm_campaign=legal_privacy_login
            - text: "&"
            - link "Terms" [ref=e74] [cursor=pointer]:
              - /url: https://vwo.com/terms/?utm_medium=website&utm_source=login-page&utm_campaign=legal_terms_login
            - text: .
      - generic [ref=e78]:
        - img "Vwo abtasty logo" [ref=e79]
        - generic [ref=e80]:
          - heading "have joined forces to redefine the future of" [level=4] [ref=e81]
          - heading "Digital Experience Optimization" [level=4] [ref=e82]
        - img "Vwo Abtasty Shakehands" [ref=e83]
        - heading "Rest assured, your day-to-day workflow, support team, and account contacts remain exactly the same. We are growing to serve you better." [level=5] [ref=e84]
  - img [ref=e85]:
    - generic:
      - img
  - img [ref=e86]
  - img [ref=e87]
  - img [ref=e88]
  - img [ref=e89]
  - img [ref=e90]
  - img [ref=e91]
  - img [ref=e92]
  - img [ref=e93]
  - img [ref=e94]
  - img [ref=e95]
  - img [ref=e96]
  - img [ref=e97]
  - img [ref=e98]
  - img [ref=e99]
  - img [ref=e100]
  - img [ref=e101]
  - img [ref=e102]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BASE_URL = 'https://app.vwo.com/#/login';
  4   | 
  5   | // Helper: wait for login form to be ready
  6   | async function goToLogin(page: any) {
  7   |   await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  8   |   // Wait for the Sign In button to be present by its stable ID
  9   |   await page.waitForSelector('#js-login-btn', { timeout: 60000 });
  10  | }
  11  | 
  12  | // ─── TC-N001: Invalid Email Format ──────────────────────────────────────────
  13  | test('TC-N001: Login fails with invalid email format', async ({ page }) => {
  14  |   await goToLogin(page);
  15  | 
  16  |   await page.getByRole('textbox', { name: 'Email address' }).fill('invalid_email_format');
  17  |   await page.getByRole('textbox', { name: 'Password' }).fill('Password123!');
  18  |   await page.locator('#js-login-btn').click();
  19  |   await page.waitForTimeout(2000);
  20  | 
  21  |   // VWO shows "Required field" for invalid/missing email
  22  |   const errorText = await page.locator('[class*="error"]').allInnerTexts();
> 23  |   const hasRequiredFieldError = errorText.some((t: string) => t.includes('Required field'));
      |                                                                 ^ TypeError: Cannot read properties of undefined (reading 'includes')
  24  | 
  25  |   expect(hasRequiredFieldError, `Expected a "Required field" validation error. Got: ${JSON.stringify(errorText)}`).toBeTruthy();
  26  | 
  27  |   // Page should remain on login
  28  |   expect(page.url()).toContain('login');
  29  | });
  30  | 
  31  | // ─── TC-N002: Empty Email Field ──────────────────────────────────────────────
  32  | test('TC-N002: Login fails when email field is empty', async ({ page }) => {
  33  |   await goToLogin(page);
  34  | 
  35  |   // Leave email blank, fill password
  36  |   await page.getByRole('textbox', { name: 'Password' }).fill('Password123!');
  37  |   await page.locator('#js-login-btn').click();
  38  |   await page.waitForTimeout(2000);
  39  | 
  40  |   const errorText = await page.locator('[class*="error"]').allInnerTexts();
  41  |   const hasError = errorText.some((t: string) => t.includes('Required field') || t.trim() !== '');
  42  | 
  43  |   expect(hasError, `Expected a validation error for empty email. Got: ${JSON.stringify(errorText)}`).toBeTruthy();
  44  |   expect(page.url()).toContain('login');
  45  | });
  46  | 
  47  | // ─── TC-N003: Empty Password Field ──────────────────────────────────────────
  48  | test('TC-N003: Login fails when password field is empty', async ({ page }) => {
  49  |   await goToLogin(page);
  50  | 
  51  |   await page.getByRole('textbox', { name: 'Email address' }).fill('test.user@example.com');
  52  |   // Leave password blank
  53  |   await page.locator('#js-login-btn').click();
  54  |   await page.waitForTimeout(2000);
  55  | 
  56  |   const errorText = await page.locator('[class*="error"]').allInnerTexts();
  57  |   const hasError = errorText.some((t: string) => t.includes('Required field') || t.trim() !== '');
  58  | 
  59  |   expect(hasError, `Expected a validation error for empty password. Got: ${JSON.stringify(errorText)}`).toBeTruthy();
  60  |   expect(page.url()).toContain('login');
  61  | });
  62  | 
  63  | // ─── TC-N004: Incorrect Password Credentials ────────────────────────────────
  64  | test('TC-N004: Login fails with valid email but incorrect password', async ({ page }) => {
  65  |   await goToLogin(page);
  66  | 
  67  |   await page.getByRole('textbox', { name: 'Email address' }).fill('automation.test.vwo@example.com');
  68  |   await page.getByRole('textbox', { name: 'Password' }).fill('IncorrectPass!123');
  69  |   await page.locator('#js-login-btn').click();
  70  | 
  71  |   // VWO shows a notification — wait for it
  72  |   await page.waitForSelector('[class*="notification"]', { timeout: 15000 });
  73  |   const notifications = await page.locator('[class*="notification"]').allInnerTexts();
  74  |   const hasCredentialError = notifications.some((t: string) =>
  75  |     t.toLowerCase().includes('did not match') ||
  76  |     t.toLowerCase().includes('invalid') ||
  77  |     t.toLowerCase().includes('incorrect')
  78  |   );
  79  | 
  80  |   expect(
  81  |     hasCredentialError,
  82  |     `Expected credentials mismatch notification. Got: ${JSON.stringify(notifications)}`
  83  |   ).toBeTruthy();
  84  |   expect(page.url()).toContain('login');
  85  | });
  86  | 
  87  | // ─── TC-N005: Password Contains Only Spaces ──────────────────────────────────
  88  | test('TC-N005: Login fails when password contains only spaces', async ({ page }) => {
  89  |   await goToLogin(page);
  90  | 
  91  |   await page.getByRole('textbox', { name: 'Email address' }).fill('test.user@example.com');
  92  |   await page.getByRole('textbox', { name: 'Password' }).fill('       ');
  93  |   await page.locator('#js-login-btn').click();
  94  |   await page.waitForTimeout(2000);
  95  | 
  96  |   const errorText = await page.locator('[class*="error"]').allInnerTexts();
  97  |   const notifications = await page.locator('[class*="notification"]').allInnerTexts();
  98  |   const allMessages = [...errorText, ...notifications];
  99  | 
  100 |   const hasError = allMessages.some((t: string) =>
  101 |     t.includes('Required field') ||
  102 |     t.toLowerCase().includes('invalid') ||
  103 |     t.toLowerCase().includes('did not match') ||
  104 |     t.trim() !== ''
  105 |   );
  106 | 
  107 |   expect(hasError, `Expected validation error for space-only password. Got: ${JSON.stringify(allMessages)}`).toBeTruthy();
  108 |   expect(page.url()).toContain('login');
  109 | });
  110 | 
```