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

    // Click the ellipsis (Options)
    const optionsClicked = await page.evaluate(() => {
      const optionsButton = document
        .querySelector('div[role="button"] svg[aria-label="Options"]')
        ?.closest('div[role="button"]');
      if (optionsButton) {
        optionsButton.click();
        return true;
      }
      return false;
    });

    if (!optionsClicked) {
      console.log("⚠️ Options button not found. Skipping lead...");
      navigatedToDM = false;
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Click the "Send message" button in the popup
      const sendMessageClicked = await page.evaluate(() => {
        const sendMessageButton = Array.from(document.querySelectorAll('button[tabindex="0"]'))
          .find(btn => btn.textContent.trim() === "Send message");
        if (sendMessageButton) {
          sendMessageButton.click();
          return true;
        }
        return false;
      });

      if (!sendMessageClicked) {
        console.log("⚠️ 'Send message' button not found in options. Skipping lead...");
        navigatedToDM = false;
      } else {
        navigatedToDM = true;
      }
    }
  }

  if (navigatedToDM) {
    // Wait for the message input to appear.
    await page.waitForSelector('div[role="textbox"][contenteditable="true"]', { visible: true });

    // Click "Not Now" if that prompt appears.
    await page.evaluate(() => {
      const notNowButton = [...document.querySelectorAll('button')]
        .find(btn => btn.textContent.trim() === 'Not Now');
      notNowButton?.click();
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Type out the message.
    const messageBox = await page.$('div[role="textbox"][contenteditable="true"]');
    console.log(`✉️ Typing message: ${messageText}`);
    for (let char of messageText) {
      // 10% chance to simulate a typing mistake.
      if (Math.random() < 0.1) {
        const wrongChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        await messageBox.type(wrongChar, { delay: getRandomDelay() });
        await messageBox.press('Backspace');
      }
      await messageBox.type(char, { delay: getRandomDelay() });
    }
    await messageBox.press("Enter");

    console.log("✅ Message sent successfully!");
    // Pause for 20 seconds after sending the message.
    await new Promise(resolve => setTimeout(resolve, 20000));
  }

  await browser.close();
}




module.exports = { sendInstagramMessage };
