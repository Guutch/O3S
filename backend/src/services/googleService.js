const { google } = require("googleapis");
const db = require("../../models");
// const { SendingAccount } = require("../../models"); // Use the centralized index.js
// const db = require("../../models");
const SendingAccount = db.SendingAccount;

/**
 * Function to send an email using the Gmail API.
 * @param {string} recipientEmail - The recipient's email address.
 * @param {string} subject - The email subject.
 * @param {string} body - The email body content.
 * @param {number} userId - The user ID used to look up the sending account.
 */
 async function sendEmail(recipientEmail, subject, body, userId) {
    try {
      console.log("sendEmail parameters:", { recipientEmail, subject, body, userId });
  
      // Retrieve the user's sending account (for platform 'email')
      const account = await SendingAccount.findOne({
        where: { user_id: userId, platform: "email", is_active: true },
      });
  
      console.log("This is the account", account);
  
      if (!account || !account.access_token) {
        console.error("❌ No access token found for user with user_id", userId);
        return { success: false, message: "No access token found." };
      }
  
      // (Optional) Check for token expiry
      // if (account.token_expires_at) { ... }
  
      // Authenticate with Gmail
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: account.access_token });
      const gmail = google.gmail({ version: "v1", auth });
  
      // Build the email lines with no extra indentation
      const emailLines = [
        `From: ${account.account_identifier}`,
        `To: ${recipientEmail}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "",
        body,
      ];
      const emailContent = emailLines.join("\r\n");
  
      // Encode in Base64 URL-safe format
      const encodedMessage = Buffer.from(emailContent)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
  
      // Send the email
      const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedMessage },
      });
      console.log("✅ Email sent successfully:", response.data);
      return { success: true, message: "Email sent successfully." };
    } catch (error) {
      console.error("❌ Error sending email:", error.message);
      return { success: false, message: error.message };
    }
  }
  
  

module.exports = { sendEmail };
