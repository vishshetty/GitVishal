package GenericComp_Search_Int;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import io.appium.java_client.android.AndroidDriver;

public class BaseClass {
	public static Process process;  
	public static AndroidDriver driver;
public static void Startserver() throws IOException{
		String Server="D:\\Appium\\node.exe D:\\Appium\\node_modules\\appium.js";
		process = Runtime.getRuntime().exec(Server);
		if (process!=null) {
			System.out.println("Process started");
		}else{
			System.out.println("Process not started");
		}
	}
	public static void Initapp() throws MalformedURLException, InterruptedException{
		DesiredCapabilities capabilities=new DesiredCapabilities();
		capabilities.setCapability("deviceName", "MotoE2");
		capabilities.setCapability("platformName", "Android");
		capabilities.setCapability("platformVersion", "5.1");
		capabilities.setCapability("appPackage", "com.bigbasket.mobileapp");
		capabilities.setCapability("appActivity", "com.bigbasket.mobileapp.activity.SplashActivity");
		driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
		Thread.sleep(5000);
	}
    public static void Stopserver() throws InterruptedException{
    	if (process!=null) {
    		process.destroy();
			System.out.println("Process stopped");
			driver.quit();
		}
	}
   public static void Explicitwait(WebElement WE, long time){
		WebDriverWait wt= new WebDriverWait(driver,time);
		wt.until(ExpectedConditions.visibilityOf(WE)).isDisplayed();
	}
   //////////Needs to be worked upon/////
   public static void Screenshot(String TC_ID, String Order_Set) throws IOException{
	    Date D=new Date();
	    SimpleDateFormat SF=new SimpleDateFormat("yyyy-mm-dd hh-mm-ss");
	    File F = new File(SF.format(D)+".png");
		TakesScreenshot Ts=(TakesScreenshot)driver;
		File screenshotAs = Ts.getScreenshotAs(OutputType.FILE);
		FileUtils.copyFile(screenshotAs, new File("E:\\Appium\\APPIUM DOCUMENTS\\Classes\\Jan22_BB_Project\\Screenshot\\"+TC_ID+"-"+Order_Set
+"-"+F));
	}
}
