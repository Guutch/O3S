const { google } = require("googleapis");
const db = require("../../models");
// const { SendingAccount } = require("../../models"); // Use the centralized index.js
// const db = require("../../models");
const SendingAccount = db.SendingAccount;

/**
 * Function to send an email using Gmail API
 * @param {string} userEmail - The user's email who authenticated
 * @param {string} recipientEmail - The recipient's email
 * @param {string} subject - Email subject
 * @param {string} body - Email body content
 */
async function sendEmail(userEmail, recipientEmail, subject, body) {
    try {
        // Fetch the user's stored access token
        const account = await SendingAccount.findOne({
            where: { account_identifier: userEmail },
        });

        if (!account || !account.access_token) {
            console.error("❌ No access token found for user.");
            return { success: false, message: "No access token found." };
        }

        // Authenticate with Gmail API
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: account.access_token });

        const gmail = google.gmail({ version: "v1", auth });

        // Construct email content
        const emailContent = `From: ${userEmail}
To: ${recipientEmail}
Subject: ${subject}
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

${body}
`;

        // Encode email in Base64 format
        const encodedMessage = Buffer.from(emailContent)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");

        // Send email
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
