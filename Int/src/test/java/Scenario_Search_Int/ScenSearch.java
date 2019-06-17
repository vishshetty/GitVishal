package Scenario_Search_Int;
import java.io.IOException;
import java.util.Map;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;
import GenericComp_Search_Int.BaseClass;
import PageObject_Search_Int.POSearch;
import org.apache.log4j.Logger;

public class ScenSearch extends BaseClass{
	@Test(dataProvider="Invalid",dataProviderClass=DataProvider_Search_Int.DPSearch.class)
	public void InvalidTest(Map M) throws IOException, InterruptedException{
		Logger log = Logger.getLogger(ScenSearch.class);
		SoftAssert SA= new SoftAssert();
		String Order_Set = M.get("Order_Set").toString();
		String TC_ID = M.get("TC_ID").toString();
		String Search_Item = M.get("Search_Item").toString();
		String Exp_Result = M.get("Exp_Result").toString();
		
		Startserver();
		Initapp();
		
		log.info("Executing testcase");
		POSearch POS=new POSearch(driver);
		Explicitwait(POS.searchbox,5);
		POS.searchclick(Search_Item);
		Explicitwait(POS.searchmsg,5);
		String actres = POS.searchval();
		if (Exp_Result.contains(actres)) {
			log.info("this test is passed");
			Screenshot(TC_ID, Order_Set);
		}else{
			log.info("fail");
			SA.fail("this test is failed");
			Screenshot(TC_ID, Order_Set);
			}
		
        Stopserver();
		SA.assertAll();
		}
	
	
//	@Test(dataProvider="Valid",dataProviderClass=DataProvider_Search_Int.DPSearch.class)
//	public void ValidTest(){
//		
//	}
}
