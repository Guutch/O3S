const puppeteer = require('puppeteer');

// node loomData.js

const cookieJson = [
  {
    "domain": ".www.loom.com",
    "expirationDate": 1746216901.059876,
    "hostOnly": false,
    "httpOnly": true,
    "name": "connect.sid",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": "s%3A3HTIp42FCQUJkkvJ22eOS74aSZomMhJj.mE09qaERBgPDaf%2F%2FCPmTg%2BbVWGSOi5w4PX9LrLvP6FE"
  },
  {
    "domain": "www.loom.com",
    "expirationDate": 1746216901.059628,
    "hostOnly": true,
    "httpOnly": true,
    "name": "connect.lpid",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": "p%3Alpid-eff6c315-ddca-4862-8e27-245ad0c9f8f7.QRJtqPzZCrvcmpT3tP%2FjuWvyqgcwwlqUDklISRTBbFYv1"
  },
  {
    "domain": "www.loom.com",
    "expirationDate": 1743646338.243182,
    "hostOnly": true,
    "httpOnly": true,
    "name": "__Host-psifi.analyticsTraceV2",
    "path": "/",
    "sameSite": "strict",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": "440e51c2fbbf2ab6b559ef6ca89ebce59af0526708904669d44e6f7600e6698cf38af912be92f408b101e76f03b2b59e22645dd46ff75cb3c34440d03227961e"
  },
  {
    "domain": ".www.loom.com",
    "expirationDate": 1775160749,
    "hostOnly": false,
    "httpOnly": false,
    "name": "__stripe_mid",
    "path": "/",
    "sameSite": "strict",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": "512da5f5-fe6b-4d2e-8bf1-5eca79cab03169094f"
  },
  {
    "domain": "www.loom.com",
    "expirationDate": 1743646338.242929,
    "hostOnly": true,
    "httpOnly": true,
    "name": "__Host-psifi.analyticsTrace",
    "path": "/",
    "sameSite": "strict",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": "de4cf0555f5dcef3c4ca4a42677e41852f54c92a4d11066d894adf7e52d54be3"
  },
  {
    "domain": ".www.loom.com",
    "expirationDate": 1743626549,
    "hostOnly": false,
    "httpOnly": false,
    "name": "__stripe_sid",
    "path": "/",
    "sameSite": "strict",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": "e8f4cbfc-121f-4156-a994-013816d18aff551ab1"
  },
  {
    "domain": ".loom.com",
    "expirationDate": 1751543059.609525,
    "hostOnly": false,
    "httpOnly": false,
    "name": "loom_anon_comment",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": ""
  },
  {
    "domain": ".loom.com",
    "expirationDate": 1751543059.609585,
    "hostOnly": false,
    "httpOnly": false,
    "name": "loom_anon_comment_name",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": ""
  },
  {
    "domain": ".loom.com",
    "expirationDate": 1751543059.609443,
    "hostOnly": false,
    "httpOnly": false,
    "name": "loom_anon_id",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": ""
  }
];

async function scrapeLoomData(loomUrl) {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  const adjustedCookies = cookieJson.map(cookie => {
    const newCookie = { ...cookie };
    if (!newCookie.sameSite || typeof newCookie.sameSite !== 'string') {
      delete newCookie.sameSite;
    }
    newCookie.domain = newCookie.domain || '.loom.com';
    newCookie.path = newCookie.path || '/';
    return newCookie;
  });
  await page.setCookie(...adjustedCookies);
  console.log("✅ Loom cookies set.");

  await page.goto(loomUrl, { waitUntil: 'networkidle2' });

  // Wait for the "Views" button to be available, wait an extra 500ms, then click it
  await page.waitForSelector('button[data-testid="sidebar-tab-Views"]');
  await new Promise(resolve => setTimeout(resolve, 500));
  await page.click('button[data-testid="sidebar-tab-Views"]');

  // Wait for the average completion rate element to appear
  await page.waitForSelector('ul.viewer-insights_viewsMetadata_3ii li');

  // Extract the average completion rate and convert it to a number
  const viewRate = await page.evaluate(() => {
    const li = Array.from(document.querySelectorAll('ul.viewer-insights_viewsMetadata_3ii li'))
      .find(li => li.innerText.includes('Average Completion Rate'));
    const span = li?.querySelector('span.css-izb9em');
    if (span) {
      const text = span.innerText.trim();
      // Remove any non-digit characters and convert to a number
      return Number(text.replace(/[^\d\.]/g, ''));
    }
    return null;
  });

  console.log(`📊 Average Completion Rate: ${viewRate}%`);

  await browser.close();
}

const loomUrl = 'https://www.loom.com/share/3b0be1cd0de74d16a4aee1c10624eb30?sid=9726318a-b5fb-4160-9d66-3f7f26143112';
scrapeLoomData(loomUrl);
