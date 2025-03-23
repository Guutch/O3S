// // Handles launching Puppeteer
// const puppeteer = require('puppeteer');
// const { loadCookies, saveCookies } = require('./cookieManager');

// async function launchBrowser(userId) {
//     const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
//     const page = await browser.newPage();

//     // Load stored cookies from DB
//     try {
//         const cookies = await loadCookies(userId);
//         await page.setCookie(...cookies);
//         console.log("✅ Cookies loaded, logging in...");
//     } catch (error) {
//         console.error("⚠️ No cookies found. User may need to log in.");
//     }

//     await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });

//     return { browser, page };
// }

// module.exports = { launchBrowser };
// puppeteerHandler.js
const puppeteer = require('puppeteer');
const { loadCookies } = require('./cookieManager');

async function launchBrowser(userId) {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();
  
    // Load stored cookies from DB
    try {
      const cookies = await loadCookies(userId);
      console.log("Loaded cookies from DB:", cookies);
      
      // Adjust cookies: remove sameSite if it's not a valid string
      const adjustedCookies = cookies.map(cookie => {
        const newCookie = { ...cookie };
        // Remove sameSite if it is null or not a string
        if (!newCookie.sameSite || typeof newCookie.sameSite !== 'string') {
          delete newCookie.sameSite;
        }
        // Ensure required fields
        newCookie.domain = newCookie.domain || '.instagram.com';
        newCookie.path = newCookie.path || '/';
        return newCookie;
      });
      console.log("Adjusted cookies:", adjustedCookies);
      await page.setCookie(...adjustedCookies);
      console.log("✅ Cookies set, logging in...");
    } catch (error) {
      console.error("⚠️ No cookies found. User may need to log in.", error);
    }
  
    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
    return { browser, page };
  }

module.exports = { launchBrowser };

