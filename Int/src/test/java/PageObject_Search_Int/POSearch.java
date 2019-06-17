package PageObject_Search_Int;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

import io.appium.java_client.android.AndroidDriver;

public class POSearch {

	@FindBy(id="com.bigbasket.mobileapp:id/homePageSearchBox")
	public WebElement searchbox;
	@FindBy(id="com.bigbasket.mobileapp:id/txtEmptyMsg1")
	public WebElement searchmsg;
	
	public POSearch(AndroidDriver driver){
		PageFactory.initElements(driver, this);
	}
	public void searchclick(String item){
		searchbox.sendKeys(item+"\n");
    }
	public String searchval(){
	String text = searchmsg.getText();
	return text;
	}
}
