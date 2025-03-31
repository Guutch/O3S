// instagramAccountsRoutes.js
const express = require('express');
const router = express.Router();
const InstagramAccount = require('../models/InstagramAccount'); // Import the correct model

// GET /api/instagramAccounts?userId=...
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    // Use the correct model name and field name
    const accounts = await InstagramAccount.findAll({ where: { user_id: userId } });
    res.json(accounts);
  } catch (error) {
    console.error("Error fetching Instagram accounts:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
