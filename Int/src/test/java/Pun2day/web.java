package Pun2day;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;

public class web {
public static void main(String[] args) throws MalformedURLException, InterruptedException {
	DesiredCapabilities capabilities=new DesiredCapabilities();
	capabilities.setCapability("deviceName", "MotoE2");
	capabilities.setCapability("platformName", "Android");
	capabilities.setCapability("platformVersion", "5.1");
	capabilities.setCapability(CapabilityType.BROWSER_NAME, "Chrome");
	
//	AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
//	driver.get("https://www.unionbankofindia.co.in/english/emicalculator.aspx");
//	Thread.sleep(10000);
//	driver.findElementById("Button1").click();
//	Thread.sleep(10000);
//	driver.switchTo().alert().accept();
	
	AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
    driver.get("http://books.rediff.com/");
    Thread.sleep(10000);
    
    driver.findElementById("srchword").sendKeys("Kalam");
    driver.findElementByXPath("//input[@type='submit'][@class='srchbtn_n']").click();
    Thread.sleep(5000);
    
    List<WebElement> tag = driver.findElementsByTagName("a");
    
    for (WebElement data : tag) {
    	System.out.println(data.getText());
		if (data.getText().contains("AGNI KI")) {
			System.out.println("present");
			data.click();
			break;
			}
	}
    driver.findElementByXPath("//input[@value='Buy Now'][@class='buynowbtn']").click();
    String text = driver.findElementByCssSelector("#currentcartdiv > div.cart_prd_row > div.prddetail > span:nth-child(1)").getText();
    if (text.contains("AGNI KI")) {
		System.out.println("pass");
	}
}

}
