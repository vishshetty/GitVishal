package Pun2day;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Set;

import org.openqa.selenium.remote.DesiredCapabilities;
import io.appium.java_client.android.AndroidDriver;

public class context {
	public static void main(String[] args) throws MalformedURLException, InterruptedException {
		DesiredCapabilities capabilities=new DesiredCapabilities();
		capabilities.setCapability("deviceName", "Lenovo A7020a48");
		capabilities.setCapability("platformName", "Android");
		capabilities.setCapability("platformVersion", "6.0");
		capabilities.setCapability("appPackage", "com.snc.test.webview2");
        capabilities.setCapability("appActivity","com.snc.test.webview.activity.MainActivity");
        AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
		Thread.sleep(4000);
		Set<String> contextHandles = driver.getContextHandles();
		System.out.println(contextHandles.size());
		for (String data : contextHandles) {
			System.out.println(data.toString());
		}
		Thread.sleep(4000);
		driver.findElementById("com.snc.test.webview2:id/action_go_website").click();
		Set<String> contextHandles1 = driver.getContextHandles();
		System.out.println(contextHandles1.size());
		for (String data : contextHandles1) {
			System.out.println(data.toString());
//			if (data.contains("WEBVIEW")) {
//				driver.context(data);
//				break;
//			}
		}
		
		
//		String text = driver.findElementById("com.snc.test.webview2:id/input_url").getText();
//		System.out.println(text);
		
	}

}
