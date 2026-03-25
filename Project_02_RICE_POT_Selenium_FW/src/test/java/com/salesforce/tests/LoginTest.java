package com.salesforce.tests;

import com.salesforce.base.BaseTest;
import com.salesforce.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    private LoginPage loginPage;
    private static final String APP_URL = "https://login.salesforce.com/?locale=in";

    @BeforeMethod
    public void setupPage() {
        try {
            loginPage = new LoginPage(driver);
            loginPage.navigateToLogin(APP_URL);
        } catch (Exception e) {
            throw new RuntimeException("Test initialization failed: " + e.getMessage(), e);
        }
    }

    @Test(priority = 1, description = "Verify successful login with valid credentials")
    public void testValidLogin() {
        try {
            // Note: Since this is purely for structure/framework demonstration, 
            // these credentials are placeholders and won't actually pass the auth gate.
            loginPage.doLogin("valid_user@salesforce.com", "valid_password123");
            
            // Assuming successful login redirects away from login page or changes title
            String currentTitle = driver.getTitle();
            Assert.assertFalse(currentTitle.contains("Login"), "Title still contains Login, validation failed!");
        } catch (Exception e) {
            Assert.fail("Valid login test failed due to exception: " + e.getMessage());
        }
    }

    @Test(priority = 2, description = "Verify failed login with invalid credentials")
    public void testInvalidLogin() {
        try {
            loginPage.doLogin("invalid_user@salesforce.com", "wrong_password");
            
            String errorMessage = loginPage.getErrorMessage();
            Assert.assertTrue(errorMessage.contains("check your username and password"), 
                "Error message mismatch or not found. Actual text: " + errorMessage);
        } catch (Exception e) {
            Assert.fail("Invalid login test failed due to exception: " + e.getMessage());
        }
    }
}
