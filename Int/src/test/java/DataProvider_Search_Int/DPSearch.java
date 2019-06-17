package DataProvider_Search_Int;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.testng.annotations.DataProvider;

import GenericComp_Search_Int.ExcelReadWrite;

public class DPSearch {
	@DataProvider(name="Invalid")
	public static Iterator<Object[]> InvSearch() throws IOException{
		List<Object[]> flagrowcount = Flagrowcount("InvalidSearch");
		return flagrowcount.iterator();
	}
	@DataProvider(name="Valid")
	public static Iterator<Object[]> VSearch() throws IOException{
		List<Object[]> flagrowcount = Flagrowcount("ValidSearch");
		return flagrowcount.iterator();
	}
	
	public static List<Object[]> Flagrowcount(String ScriptN) throws IOException{
	   ExcelReadWrite Ex= new ExcelReadWrite("E:\\Appium\\APPIUM DOCUMENTS\\Classes\\Jan22_BB_Project\\TestData\\TestData.xls");
	   HSSFSheet Sheet = Ex.Setsheet("Scenario_Search");
		int rc = Ex.getrowcount(Sheet);
		int cc = Ex.getcolcount(Sheet, 0);
		List<Object[]> Li=new ArrayList<Object[]>();
		for (int i = 1; i <= rc; i++) {
			String ExecuteFlag = Ex.Readvalue(Sheet, i, "Execute_Flag");
			String Scriptname = Ex.Readvalue(Sheet, i, "Script_name");
			if (ExecuteFlag.equals("Y") && Scriptname.equalsIgnoreCase(ScriptN) ) {
				Map<String,String> dsmap=new HashMap<String,String>();
				for (int j = 0; j < cc; j++) {
					String skey = Ex.Readvalue(Sheet, 0, j);
					String sval = Ex.Readvalue(Sheet, i, j);
					dsmap.put(skey, sval);
				}
				 Object[] x=new Object[1];
				    x[0]=dsmap;
				    Li.add(x);
				}
			}
		return Li;
		}
	 }
