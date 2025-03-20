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
    console.log("HERE HERE HERE")

    console.log(req.body)
    const { user_id, username, cookies } = req.body;

    console.log("HERE HERE HERE")

    if (!user_id || !username || !cookies) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const newAccount = await InstagramAccount.create({
            user_id: user_id,
            username: username,
            cookies: cookies,
            is_active: true // Using the default value, but explicitly setting it here
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

module.exports = router;
