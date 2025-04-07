// API endpoints to trigger IG actions
const express = require('express');
const { sendInstagramMessage } = require('../instagram/instagramService');
const InstagramAccount = require('../models/InstagramAccount');


const router = express.Router();

// Send a message
router.post('/send', async (req, res) => {
    const { userId, recipientUsername, message } = req.body;

    if (!userId || !recipientUsername || !message) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        await sendInstagramMessage(userId, recipientUsername, message);
        res.json({ success: true, message: "Message sent successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add an Instagram account
router.post('/add', async (req, res) => {
    console.log("HERE HERE HERE");
    console.log(req.body);
  
    const { user_id, username, cookies } = req.body;
    console.log("HERE HERE HERE");
  
    if (!user_id || !username || !cookies) {
      return res.status(400).json({ error: "Missing required fields." });
    }
  
    try {
      let parsedCookies = cookies;
      if (typeof cookies === "string") {
        try {
          parsedCookies = JSON.parse(cookies);
        } catch (parseError) {
          console.error("Error parsing cookies JSON:", parseError);
          return res.status(400).json({ error: "Invalid cookies format." });
        }
      }
  
      // Stringify cookies to satisfy the model's string requirement
      const newAccount = await InstagramAccount.create({
        user_id,
        username,
        cookies: JSON.stringify(parsedCookies),
        is_active: true
      });
  
      res.json({
        success: true,
        message: "Instagram account added successfully.",
        id: newAccount.id
      });
    } catch (error) {
      console.error("Error creating Instagram account:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  

// POST /api/instagram/send-message
router.post('/send-message', async (req, res) => {
    try {
      const { userId, recipientUsername, messageText } = req.body;
      console.log("Send message request received:", { userId, recipientUsername, messageText });
      if (!userId || !recipientUsername || !messageText) {
        return res.status(400).json({ error: "Missing required fields." });
      }
      await sendInstagramMessage(userId, recipientUsername, messageText);
      res.json({ success: true, message: "Message sent successfully." });
    } catch (error) {
      console.error("Error sending Instagram message:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

module.exports = router;
