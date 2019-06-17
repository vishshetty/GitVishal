package Pun2day;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;

public class msg {
	public static void main(String[] args) throws MalformedURLException, InterruptedException{
		DesiredCapabilities capabilities=new DesiredCapabilities();
		capabilities.setCapability("deviceName", "MotoE2");
		capabilities.setCapability("platformName", "Android");
		capabilities.setCapability("platformVersion", "5.1");
		capabilities.setCapability("appPackage", "com.android.mms");
		capabilities.setCapability("appActivity", "com.android.mms.ui.ConversationList");
		
		AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
		driver.findElementById("com.android.mms:id/action_compose_new").click();
		driver.findElementById("com.android.mms:id/recipients_editor").sendKeys("70 22 205849");
		driver.findElementById("com.android.mms:id/embedded_text_editor").sendKeys("Jan");
		driver.findElementById("com.android.mms:id/send_button_sms").click();
		driver.sendKeyEvent(AndroidKeyCode.BACK);
		driver.sendKeyEvent(AndroidKeyCode.BACK);
//        String exp = driver.findElementById("com.android.mms:id/from").getText();
//        if (exp.contains("70 22 205849")) {
//			System.out.println("Pass");
//		} else {
//            System.out.println("Fail");
//		}
//		int flag=0;
//		List<WebElement> Parlist = driver.findElementsById("com.android.mms:id/from");
//		for (WebElement data : Parlist) {
//			if (data.getText().equals("70 22 205849")) {
//				flag=1;
//				break;
//			} else {
//                flag=0;
//			}
//		}
//		if (flag==1) {
//			System.out.println("pass");
//		} else {
//            System.out.println("fail");
//		}
		
		///////////////sms normal loop//////////////////////////////////
		int flag=0;
		List<WebElement> Parlist = driver.findElementsById("com.android.mms:id/from");
		for (int i = 0; i < Parlist.size(); i++) {
			String text = Parlist.get(i).getText();
			if (text.contains("70 22 205849")) {
				flag=1;
			}else{
					flag=0;
			}
		}
		if (flag==1) {
			System.out.println("pass");
		}else{
			System.out.println("fail");
		}
		}
       }
