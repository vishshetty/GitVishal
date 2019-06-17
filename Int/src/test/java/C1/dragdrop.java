package C1;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;

import io.appium.java_client.TouchAction;
import io.appium.java_client.android.AndroidDriver;

public class dragdrop {

	public static void main(String[] args) throws MalformedURLException, InterruptedException {
		DesiredCapabilities capabilties= new DesiredCapabilities();
	capabilties.setCapability("deviceName", "MotoE2");
	capabilties.setCapability("platformName", "Android");
	capabilties.setCapability("platformVersion", "5.1");
		

		
		capabilties.setCapability("appPackage", "com.mobeta.android.demodslv");
		capabilties.setCapability("appActivity", "com.mobeta.android.demodslv.Launcher");
		
		AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"), capabilties);
		Thread.sleep(5000);
         driver.findElementById("com.mobeta.android.demodslv:id/activity_title").click(); 
		Thread.sleep(2000);
        List<WebElement> ParCon = driver.findElementsById("com.mobeta.android.demodslv:id/drag_handle");
        // List<WebElement> ParCon = driver.findElementsById("com.mobeta.android.demodslv:id/test_bed");
        //  List<WebElement> ParCon = driver.findElementsByXPath("//*[@text='Basic usage playground'][@index='0'][@class='android.widget.TextView']");
         System.out.println(ParCon.size());
          TouchAction action=new TouchAction(driver);
	      action.longPress(ParCon.get(0)).moveTo(ParCon.get(5)).release().perform();
	      Thread.sleep(5000);
	      action.longPress(ParCon.get(6)).moveTo(ParCon.get(1)).release().perform();   
	      
	}

}
