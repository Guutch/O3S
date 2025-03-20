// Handles launching Puppeteer
const puppeteer = require('puppeteer');
const { loadCookies, saveCookies } = require('./cookieManager');

async function launchBrowser(userId) {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();

    // Load stored cookies from DB
    try {
        const cookies = await loadCookies(userId);
        await page.setCookie(...cookies);
        console.log("✅ Cookies loaded, logging in...");
    } catch (error) {
        console.error("⚠️ No cookies found. User may need to log in.");
    }

    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });

    return { browser, page };
}

module.exports = { launchBrowser };
