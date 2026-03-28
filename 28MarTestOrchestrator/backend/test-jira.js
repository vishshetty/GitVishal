require('dotenv').config();

async function test() {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;

  console.log("host:", host);
  const url = `https://${host}/rest/api/3/search/jql`;
  const authToken = Buffer.from(`${email}:${token}`).toString('base64');
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         jql: `project = "KAN" AND issuetype = Story`,
         maxResults: 5
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch(e) {
    console.error(e);
  }
}
test();
