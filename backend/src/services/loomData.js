// loomData.js
const puppeteer = require('puppeteer');

async function scrapeLoomData() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  // Navigate to Loom
  await page.goto('https://www.loom.com/', { waitUntil: 'networkidle2' });

  // Adjust this selector to target what you need
  const data = await page.evaluate(() => {
    // Example: get text from elements with a specific class
    const items = document.querySelectorAll('.your-selector'); 
    return Array.from(items).map(item => item.textContent.trim());
  });

  console.log('Collected data:', data);
  await browser.close();
}

scrapeLoomData();
