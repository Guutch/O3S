// Main logic to send messages
const { launchBrowser } = require('./puppeteerHandler');
const InstagramAccount = require('../models/InstagramAccount');

async function sendInstagramMessage(userId, recipientUsername, messageText) {
    const { browser, page } = await launchBrowser(userId);
  
    console.log(`🔍 Navigating to ${recipientUsername}...`);
    await page.goto(`https://www.instagram.com/${recipientUsername}/`, { waitUntil: 'networkidle2' });
  
    // Find the "Message" button using evaluateHandle
    const messageButtonHandle = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('div[role="button"]'))
        .find(el => el.innerText.includes("Message"));
    });
  
    const messageButton = messageButtonHandle.asElement();
    if (messageButton) {
      console.log("✅ Clicking the Message button...");
      await messageButton.click();
      await page.waitForSelector('div[role="textbox"][contenteditable="true"]', { visible: true });
  
      // Send message
      console.log(`✉️ Sending message: ${messageText}`);
      const messageBox = await page.$('div[role="textbox"][contenteditable="true"]');
      for (let char of messageText) {
        await messageBox.type(char, { delay: Math.random() * 200 + 50 });
      }
      await messageBox.press("Enter");
  
      console.log("✅ Message sent successfully!");
    } else {
      console.log("⚠️ Message button not found. User may need to follow the recipient.");
    }
  
    await browser.close();
  }
  

module.exports = { sendInstagramMessage };
