package Pune1day;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.selenium.Keys;
import org.openqa.selenium.remote.DesiredCapabilities;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;

public class codefw {
	public static void main(String[] args) throws InterruptedException, IOException{
		String Server="D:\\Appium\\node.exe D:\\Appium\\node_modules\\appium.js";
		Process process = Runtime.getRuntime().exec(Server);
		if (process!=null) {
			System.out.println("Process started");
			}else{
			System.out.println("Process not started");
		}
		DesiredCapabilities capabilities=new DesiredCapabilities();
		capabilities.setCapability("deviceName", "MotoE2");
		capabilities.setCapability("platformName", "Android");
		capabilities.setCapability("platformVersion", "5.1");
		capabilities.setCapability("appPackage", "com.bigbasket.mobileapp");
        capabilities.setCapability("appActivity","com.bigbasket.mobileapp.activity.SplashActivity");
        AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
        Thread.sleep(2000);

        driver.findElementById("com.bigbasket.mobileapp:id/homePageSearchBox").sendKeys("###!"+"\n");
        Thread.sleep(2000);
        String text = driver.findElementById("com.bigbasket.mobileapp:id/txtEmptyMsg1").getText();
        if (text.contains("Sorry! There are no products to display.")) {
			System.out.println("pass");
			Thread.sleep(5000);
		}
        if (process!=null) {
    		process.destroy();
			System.out.println("Process stopped");
		}
	}
}
