package tests;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.*;
import pages.LoginPage;

public class LoginTest {

    WebDriver driver;
    LoginPage loginPage;

    @BeforeMethod
    public void setup() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        loginPage = new LoginPage(driver);
    }

    @Test
    public void validLoginTest() {
        loginPage.navigate();
        loginPage.login("valid_user", "valid_password");

        Assert.assertTrue(driver.getCurrentUrl().contains("dashboard"));
    }

    @Test
    public void invalidLoginTest() {
        loginPage.navigate();
        loginPage.login("invalid_user", "wrong_password");

        boolean isErrorDisplayed = driver.findElement(
            org.openqa.selenium.By.className("error-msg")
        ).isDisplayed();

        Assert.assertTrue(isErrorDisplayed);
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}
