package Pune1day;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import io.appium.java_client.TouchAction;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;

public class bbprog {

	public static void main(String[] args) throws MalformedURLException, InterruptedException{
		DesiredCapabilities capabilities=new DesiredCapabilities();
		capabilities.setCapability("deviceName", "MotoE2");
		capabilities.setCapability("platformName", "Android");
		capabilities.setCapability("platformVersion", "5.1");
		
		capabilities.setCapability("appPackage", "com.bigbasket.mobileapp");
        capabilities.setCapability("appActivity","com.bigbasket.mobileapp.activity.SplashActivity");
		
        AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
        Thread.sleep(2000);
		
		driver.findElementById("com.bigbasket.mobileapp:id/homePageSearchBox").sendKeys("###$"+"\n");
		String text = driver.findElementById("com.bigbasket.mobileapp:id/txtEmptyMsg1").getText();
		if (text.contains("Sorry! There are no products to display.")) {
			System.out.println("pass");
		}else{
			System.out.println("fail");
		}
		
		driver.sendKeyEvent(AndroidKeyCode.BACK);
		Thread.sleep(2000);
		driver.findElementById("com.bigbasket.mobileapp:id/homePageSearchBox").sendKeys("Mango"+"\n");
		Thread.sleep(2000);
		String text1 = driver.findElementById("com.bigbasket.mobileapp:id/txtProductCount").getText();
		if (text1.contains("221 Items")) {
			System.out.println("pass");
		}else{
			System.out.println("fail");
		}
		
	}
}