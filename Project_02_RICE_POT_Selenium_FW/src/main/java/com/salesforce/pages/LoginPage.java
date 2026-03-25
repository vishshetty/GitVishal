package com.salesforce.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class LoginPage {
    private WebDriver driver;
    private WebDriverWait wait;

    @FindBy(xpath = "//input[@type='email']")
    private WebElement usernameInput;

    @FindBy(xpath = "//input[@type='password']")
    private WebElement passwordInput;

    @FindBy(xpath = "//input[@type='submit' and @name='Login']")
    private WebElement loginBtn;

    @FindBy(xpath = "//div[@id='error']")
    private WebElement errorMessage;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }

    public void navigateToLogin(String url) {
        try {
            driver.get(url);
        } catch (Exception e) {
            throw new RuntimeException("Failed to navigate to: " + url, e);
        }
    }

    public void doLogin(String user, String pass) {
        try {
            wait.until(ExpectedConditions.visibilityOf(usernameInput)).sendKeys(user);
            wait.until(ExpectedConditions.visibilityOf(passwordInput)).sendKeys(pass);
            wait.until(ExpectedConditions.elementToBeClickable(loginBtn)).click();
        } catch (Exception e) {
            throw new RuntimeException("Exception occurred during login action: " + e.getMessage(), e);
        }
    }

    public String getErrorMessage() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).getText();
        } catch (Exception e) {
            throw new RuntimeException("Exception occurred while retrieving error message: " + e.getMessage(), e);
        }
    }
}
