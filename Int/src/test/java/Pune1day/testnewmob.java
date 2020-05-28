package Pune1day;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;

import io.appium.java_client.TouchAction;
import io.appium.java_client.android.AndroidDriver;

public class testnewmob {

	public static void main(String[] args) throws MalformedURLException, InterruptedException {
		DesiredCapabilities cap= new DesiredCapabilities();
		cap.setCapability("deviceName", "Mi");
		cap.setCapability("platformName", "Android");
		cap.setCapability("platformVersion", "5.0.2");
		cap.setCapability("appPackage", "com.mobeta.android.demodslv");
		cap.setCapability("appActivity", "com.mobeta.android.demodslv.Launcher");
		
		AndroidDriver driver= new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),cap);
		Thread.sleep(2000);
		
		//driver.findElementById("com.mobeta.android.demodslv:id/activity_title").click();
		//TouchAction act=new TouchAction(driver);
		//List<WebElement> ele = driver.findElementsById("com.mobeta.android.demodslv:id/drag_handle");
		//act.longPress(ele.get(0)).moveTo(ele.get(5)).release().perform();
		////////////////
		Thread.sleep(5000);
		driver.findElementByXPath("//*[@text='CursorAdapter']").click();
		List<WebElement> eleremove = driver.findElementsById("com.mobeta.android.demodslv:id/click_remove");
		List<WebElement> eletext = driver.findElementsById("com.mobeta.android.demodslv:id/text");
		
		for (int i=0; i<=eletext.size(); i++) {
			if (eletext.get(i).getText().contains("Kurt Rosenwinkel")) {
				eleremove.get(i).click();
				break;
			}
			}
		int flag=0;
		for (WebElement data : eletext) {
			if (data.getText().contains("Kurt Rosenwinkel")) {
				 flag = 0;
				}else{
					 flag=1;
					}
			}
		
		if (flag==1) {
			System.out.println("not present");
		}
			}
		
	}


