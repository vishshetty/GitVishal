package Pune1day;

import java.util.HashMap;
import java.util.Map.Entry;
import java.util.Set;

public class coding {
	
//	public static void main(String[] args) {
//		String s="hii";
//		
//		char[] charArray = s.toCharArray();
//		HashMap<Character,Integer> HS=new HashMap<Character,Integer>();
//		for (char c : charArray) {
//			if (HS.containsKey(c)) {
//				HS.put(c, HS.get(c)+1);
//			}else{
//				HS.put(c, 1);	
//				}
//			}
//		
//		Set<Entry<Character, Integer>> entrySet = HS.entrySet();
//        for (Entry<Character, Integer> entry : entrySet) {
//			System.out.println(entry);
//		}
//		
//		
//	}
////////////////////
	public static void main(String[] args) {
		int k=2345;
		String st = Integer.toString(k);
		int m=0;
		char[] ch = st.toCharArray();
		for (char data : ch) {
			int p = Integer.parseInt(String.valueOf(data));
			m=m + p;
		}
		System.out.println(m);
	}
	
	
	
}
