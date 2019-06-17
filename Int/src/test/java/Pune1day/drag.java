package Pune1day;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import io.appium.java_client.TouchAction;
import io.appium.java_client.android.AndroidDriver;

public class drag {

	public static void main(String[] args) throws MalformedURLException, InterruptedException{
		DesiredCapabilities capabilities=new DesiredCapabilities();
		capabilities.setCapability("deviceName", "MotoE2");
		capabilities.setCapability("platformName", "Android");
		capabilities.setCapability("platformVersion", "5.1");
		
		capabilities.setCapability("appPackage", "com.mobeta.android.demodslv");
		capabilities.setCapability("appActivity", "com.mobeta.android.demodslv.Launcher");
		
		AndroidDriver driver=new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"),capabilities);
		//////1///
//		driver.findElementById("com.mobeta.android.demodslv:id/activity_title").click();
//		List<WebElement> ParCon=driver.findElementsById("com.mobeta.android.demodslv:id/drag_handle");
//		int size = ParCon.size();
//		System.out.println(size);
//		
//		TouchAction action=new TouchAction(driver);
//		action.longPress(ParCon.get(0)).moveTo(ParCon.get(5)).release().perform();
		
		//////////2//////
		Thread.sleep(5000);
		driver.findElementByXPath("//*[@text='CursorAdapter']").click();
		
		List<WebElement> ParCon = driver.findElementsById("com.mobeta.android.demodslv:id/text");
		List<WebElement> ParCon_Remove = driver.findElementsById("com.mobeta.android.demodslv:id/click_remove");
		System.out.println(ParCon.size());
		int flag=0;
		for (int i = 0; i < ParCon.size(); i++) {
			String text = ParCon.get(i).getText();
			if (text.contains("Wayne Shorter")) {
				ParCon_Remove.get(i).click();
				 break;
			}
		}
		for (WebElement data : ParCon) {
			if (data.getText().contains("Wayne Shorter")) {
				flag=0;
			} else {
                flag=1;
			}
		}
		
		if (flag==1) {
			System.out.println("element deleted");
		} else {
			System.out.println("element not present");
		}
		
		
		
		
		
		
		
		
		
		
	}
}
