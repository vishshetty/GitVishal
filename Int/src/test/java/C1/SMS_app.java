package C1;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;

import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.selenium.remote.DesiredCapabilities;

public class SMS_app {
	
	public static void main(String[] args) throws MalformedURLException, InterruptedException {
		
		//Launch app
		//Launch app
				//Class            ref variable= Object
				DesiredCapabilities capabilities= new DesiredCapabilities();
				
				//device details
				capabilities.setCapability("deviceName", "Lenovo A7020a48");
				capabilities.setCapability("platformName", "Android");
				capabilities.setCapability("platformVersion", "6.0");
					
				//app details
				capabilities.setCapability("appPackage","com.google.android.apps.messaging");
				capabilities.setCapability("appActivity","com.google.android.apps.messaging.ui.ConversationListActivity");
						
				//appium server details
				AndroidDriver driver= new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
				
				//wait
				Thread.sleep(5000);
	
		
		//Click on edit msg
		//syntax -- dr.febyxpath("//tagname[@attributename='attribute value']")
		
				String Exp_Result="70222 05849";
		//Enter the number, msg and click on send
		//driver.findElementByXPath("//*[@index='1'][@class='android.widget.ImageView'][@content-desc='Compose']").click();
		driver.findElementById("com.google.android.apps.messaging:id/start_new_conversation_button").click();
		Thread.sleep(3000);
		
		driver.findElementById("com.google.android.apps.messaging:id/recipient_text_view").sendKeys("7022205849");
		driver.findElementById("com.google.android.apps.messaging:id/contact_picker_create_group").click();
		driver.findElementById("com.google.android.apps.messaging:id/compose_message_text").sendKeys("Hi Jan batch");
		
		driver.findElementById("com.google.android.apps.messaging:id/send_message_button_icon").click();
	
		Thread.sleep(3000);
		
		
		//click on back button
		driver.sendKeyEvent(AndroidKeyCode.BACK);		
		driver.sendKeyEvent(AndroidKeyCode.BACK);
		
		//get the output and validate
		String Actual_Result = driver.findElementById("com.google.android.apps.messaging:id/conversation_name").getText();
		System.out.println("Actual Result is "+Actual_Result);
		
		if(Actual_Result.contains(Exp_Result))
		{
			System.out.println("Pass");
		}
		else
		{
			System.out.println("Fail");
		}
	}

}
