const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to app.vwo.com...');
  await page.goto('https://app.vwo.com');

  console.log('Waiting for page to load...');
  await page.waitForLoadState('networkidle');

  const title = await page.title();
  console.log(`Page title: ${title}`);

  await page.screenshot({ path: 'vwo-login.png', fullPage: true });
  console.log('Screenshot saved to vwo-login.png');

  console.log('Browser will remain open for 30 seconds...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('Done!');
})();
