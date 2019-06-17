package Pun2day;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import io.appium.java_client.android.AndroidDriver;

public class prog {
public static void main(String[] args) throws InterruptedException, IOException {
	File app =new File("E:\\Appium\\APPIUM DOCUMENTS\\Classes\\11-Feb-2017\\apk\\Drag Drop\\DragDrop.apk");

	DesiredCapabilities capabilities=new DesiredCapabilities();
	capabilities.setCapability("deviceName", "MotoE2");
	capabilities.setCapability("platformName", "Android");
	capabilities.setCapability("platformVersion", "5.1");
//	capabilities.setCapability("appPackage", "com.android.mms");
//	capabilities.setCapability("appActivity", "com.android.mms.ui.ConversationList");
	capabilities.setCapability("app", app.getAbsolutePath());
	
	AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
	Thread.sleep(4000);
		boolean appInstalled = driver.isAppInstalled("com.mobeta.android.demodslv");
        if (appInstalled) {
			System.out.println("installed");
		} else {
			System.out.println("not installed");
		}

	
	///////////////////////////////screen////
	
//	DesiredCapabilities capabilities=new DesiredCapabilities();
//	capabilities.setCapability("deviceName", "MotoE2");
//	capabilities.setCapability("platformName", "Android");
//	capabilities.setCapability("platformVersion", "5.1");
//	capabilities.setCapability("appPackage", "com.android.mms");
//	capabilities.setCapability("appActivity", "com.android.mms.ui.ConversationList");
//	AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
//	Thread.sleep(2000);
//	driver.rotate(ScreenOrientation.PORTRAIT);
//	Thread.sleep(2000);
	
	////////////////////////////////screenshot/////////////

//	DesiredCapabilities capabilities=new DesiredCapabilities();
//	capabilities.setCapability("deviceName", "MotoE2");
//	capabilities.setCapability("platformName", "Android");
//	capabilities.setCapability("platformVersion", "5.1");
//	capabilities.setCapability("appPackage", "com.android.mms");
//	capabilities.setCapability("appActivity", "com.android.mms.ui.ConversationList");
//	AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
//	
//	  TakesScreenshot screenshot= (TakesScreenshot) driver;
//	  File file = screenshot.getScreenshotAs(OutputType.FILE);
//	  FileUtils.copyFile(file, new File("E:\\Appium\\APPIUM DOCUMENTS\\Classes\\screen\\abc.bmp"));
//	  
	//////////////////////////switch
	  
//	  DesiredCapabilities capabilities=new DesiredCapabilities();
//		capabilities.setCapability("deviceName", "MotoE2");
//		capabilities.setCapability("platformName", "Android");
//		capabilities.setCapability("platformVersion", "5.1");
//		capabilities.setCapability("appPackage", "com.android.mms");
//		capabilities.setCapability("appActivity", "com.android.mms.ui.ConversationList");
//		AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
//	    driver.findElementById("com.android.mms:id/action_compose_new").click();
//	    
//        driver.startActivity("com.mobeta.android.demodslv", "com.mobeta.android.demodslv.Launcher");
	
	///////////////////////zoom///////

//		DesiredCapabilities capabilities= new DesiredCapabilities();
//		File app=new File("E:\\Appium\\APPIUM DOCUMENTS\\Classes\\12-Feb-2017\\apk files\\com.davemorrissey.labs.subscaleview.sample.apk");
//		capabilities.setCapability("deviceName", "MotoE2");
//		capabilities.setCapability("platformName", "Android");
//		capabilities.setCapability("platformVersion", "5.1");
//		capabilities.setCapability("app",app.getAbsolutePath());
//		AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
//		Thread.sleep(4000);
//		driver.findElementById("com.davemorrissey.labs.subscaleview.sample:id/basicFeatures").click();
//		Thread.sleep(4000);
//		WebElement Im = driver.findElementById("com.davemorrissey.labs.subscaleview.sample:id/imageView");
//		driver.zoom(Im);
//		Thread.sleep(2000);
//		driver.pinch(Im);
	
	
	
	}
}
