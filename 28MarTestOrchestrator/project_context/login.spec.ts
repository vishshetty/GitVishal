import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('VWO Login', () => {

    test('Valid login should redirect to dashboard', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.navigate();
        await loginPage.login('valid_user', 'valid_password');

        await expect(page).toHaveURL(/dashboard/);
    });

    test('Invalid login should show error', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.navigate();
        await loginPage.login('invalid_user', 'wrong_password');

        await expect(page.locator('.error-msg')).toBeVisible();
    });

});