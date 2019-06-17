package Pun2day;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.mysql.jdbc.Driver;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;

public class prog2 {
public static void main(String[] args) throws InterruptedException, IOException {
	
	String Server = "D:\\Appium\\node.exe D:\\Appium\\node_modules\\appium\\bin\\appium.js";
	Process process=Runtime.getRuntime().exec(Server);
	Thread.sleep(4000);
	if (process!=null) {
		System.out.println("process started");
	}else{
		System.out.println("process not started");
}
	DesiredCapabilities capabilities=new DesiredCapabilities();
	capabilities.setCapability("deviceName", "MotoE2");
	capabilities.setCapability("platformName", "Android");
	capabilities.setCapability("platformVersion", "5.1");
	capabilities.setCapability("appPackage", "com.flipkart.android");
	capabilities.setCapability("appActivity", "com.flipkart.android.activity.HomeFragmentHolderActivity");
	
	AndroidDriver driver= new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
	Thread.sleep(2000);
	driver.findElementById("com.flipkart.android:id/search_widget_textbox").click();
    Thread.sleep(2000);
	driver.findElementById("com.flipkart.android:id/search_autoCompleteTextView").sendKeys("Reebok Shoes");
	Thread.sleep(4000);
	driver.findElementByXPath("//*[@text='reebok shoes sneakers']").click();
	//driver.sendKeyEvent(AndroidKeyCode.ENTER);
	Thread.sleep(7000);
	Dimension size = driver.manage().window().getSize();
	System.out.println(size);
	int starty= (int) (size.height*0.90);
	int endy=(int) (size.height*0.10);
	int startx=(int) (size.width*0.50);
	
	WebElement Textweb = driver.findElementByXPath("//*[@class='android.widget.TextView']");
	do {
		///click the item///
		List<WebElement> textele = driver.findElementsByXPath("//*[@class='android.widget.TextView'][@text='REEBOK ROYAL COMPLETE CLN Sneakers For Men']");
		int size2 = textele.size();
		System.out.println(size2);
		if (size2>0) {
	    driver.findElementByXPath("//*[@class='android.widget.TextView'][@text='REEBOK ROYAL COMPLETE CLN Sneakers For Men']").click();
	    break;
		}
		driver.swipe(startx, starty, startx, endy, 3000);
	} while (Textweb.isDisplayed()==true);
	
	
	
	
	
	
	
	
	
	
//	if (process!=null) {
//		process.destroy();
//		System.out.println("process ended");
//	}
}
}
