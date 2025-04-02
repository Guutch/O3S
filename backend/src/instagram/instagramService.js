// Main logic to send messages
const { launchBrowser } = require('./puppeteerHandler');
const InstagramAccount = require('../models/InstagramAccount');

// Returns a random delay: 30% chance of a slower delay (200-400ms) and 70% chance of a normal delay (50-250ms)
function getRandomDelay() {
  return Math.random() < 0.3 
    ? Math.random() * 200 + 250  // slower: 200-400ms
    : Math.random() * 200 + 55;  // normal: 50-250ms
}

async function sendInstagramMessage(userId, recipientUsername, messageText) {
  const { browser, page } = await launchBrowser(userId);

  console.log(`🔍 Navigating to ${recipientUsername}...`);
  await page.goto(`https://www.instagram.com/${recipientUsername}/`, { waitUntil: 'networkidle2' });

  let navigatedToDM = false;

  // Try the main "Message" button first
  const messageButtonHandle = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('div[role="button"]'))
      .find(el => el.innerText.includes("Message"));
  });

  const messageButton = messageButtonHandle.asElement();

  if (messageButton) {
    console.log("✅ Clicking the Message button...");
    await messageButton.click();
    navigatedToDM = true;
  } else {
    console.log("⚠️ Message button not found. Trying Options > Send Message...");

    await page.evaluate(() => {
      document
        .querySelector('div[role="button"] svg[aria-label="Options"]')
        ?.closest('div[role="button"]')
        ?.click();
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    await page.evaluate(() => {
      Array.from(document.querySelectorAll('button[tabindex="0"]'))
        .find(btn => btn.textContent.trim() === "Send message")
        ?.click();
    });

    navigatedToDM = true;
  }

  if (navigatedToDM) {
    // Wait for message input
    await page.waitForSelector('div[role="textbox"][contenteditable="true"]', { visible: true });

    // Click "Not Now" if needed
    await page.evaluate(() => {
      const notNowButton = [...document.querySelectorAll('button')]
        .find(btn => btn.textContent.trim() === 'Not Now');
      notNowButton?.click();
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate typing
    const messageBox = await page.$('div[role="textbox"][contenteditable="true"]');

    console.log(`✉️ Typing message: ${messageText}`);
for (let char of messageText) {
  // 10% chance to simulate a mistake
  if (Math.random() < 0.1) {
    const wrongChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    await messageBox.type(wrongChar, { delay: getRandomDelay() });
    await messageBox.press('Backspace');
  }
  await messageBox.type(char, { delay: getRandomDelay() });
}
await messageBox.press("Enter");

console.log("✅ Message sent successfully!");
// Pause for 20 seconds after the message is sent
await new Promise(resolve => setTimeout(resolve, 20000));

  }

  await browser.close();
}



module.exports = { sendInstagramMessage };
