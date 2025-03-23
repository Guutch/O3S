const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Lead = require('../models/Lead');
const { sendEmail } = require('../services/googleService'); // adjust the path as needed


// can prolly delete this
const SECRET = 'your_static_secret_key';

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// @route   GET /api/leads
// @desc    Get all leads for the authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const leads = await Lead.findAll({ where: { user_id: req.user.id } });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// @route   POST /api/leads
// @desc    Create a new lead
router.post('/', authenticate, async (req, res) => {
    const { first_name, last_name, email, ig_username, lead_status } = req.body;
    try {
        console.log("Received data:", req.body);
        console.log("User ID from token:", req.user.id);

        const newLead = await Lead.create({
            user_id: req.user.id,
            first_name,
            last_name,
            email,
            ig_username,
            lead_status,
        });

        console.log("New lead created:", newLead);
        res.status(201).json(newLead);
    } catch (err) {
        console.error("Error creating lead:", err);  // This will show in the logs
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

// @route   GET /api/leads/:id
// @desc    Get a single lead by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const lead = await Lead.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        res.json(lead);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch lead' });
    }
});

// @route   PUT /api/leads/:id
// @desc    Update a lead by ID
router.put('/:id', authenticate, async (req, res) => {
    try {
        const lead = await Lead.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        await lead.update(req.body);
        res.json(lead);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead by ID
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const lead = await Lead.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        await lead.destroy();
        res.json({ message: 'Lead deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

router.post('/email-test', async (req, res) => {
    try {
      const { leadId, senderEmail, subject, body } = req.body;
      console.log("Email test request received:", { leadId, senderEmail, subject, body });
      
      if (!leadId || !senderEmail || !subject || !body) {
        return res.status(400).json({ error: "leadId, senderEmail, subject, and body are required." });
      }
  
      // Fetch the lead from the database.
      const lead = await Lead.findByPk(leadId);
      if (!lead) {
        console.log("Lead not found for leadId:", leadId);
        return res.status(404).json({ error: "Lead not found" });
      }
      console.log("Found lead:", lead);
  
      // Use the lead's email as recipient
      const recipientEmail = lead.email;
      console.log("Sending email with details:", { senderEmail, recipientEmail, subject, body });
  
      // Call the email sending function.
      const result = await sendEmail(senderEmail, recipientEmail, subject, body);
      console.log("Result from sendEmail:", result);
  
      if (result.success) {
        return res.json({ success: true, message: result.message });
      } else {
        return res.status(500).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Error in email-test route:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });

module.exports = router;
