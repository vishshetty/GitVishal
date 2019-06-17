package GenericComp_Search_Int;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

public class Utilityclass {
  public String Readproperties(String skey) throws IOException{
	  FileInputStream Fis=new FileInputStream("Prop_File.properties");
	  Properties Prop=new Properties();
	  Prop.load(Fis);
	  return Prop.getProperty(skey);
  }
}
