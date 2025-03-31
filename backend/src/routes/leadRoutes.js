const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Lead = require('../models/Lead');
const { sendEmail } = require('../services/googleService'); // adjust the path as needed
const { readSheetData } = require('../services/sheetsService'); // Reads sheet data
const CampaignLeads = require('../models/CampaignLead');

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

  // POST /api/leads/import-sheets/:campaignId
  router.post('/import-sheets/:campaignId', async (req, res) => {
    try {
      const { campaignId } = req.params;
      // Fetch the raw data from Google Sheets
      const values = await readSheetData();
      console.log("Raw sheet values:", values);
      if (!values || values.length < 2) {
        return res.status(400).json({ success: false, message: "No data found in sheet" });
      }
      
      // Normalize the first row (headers)
      const headers = values[0].map(header =>
        header.trim().toLowerCase().replace(/\s/g, '_')
      );
      console.log("Normalized headers:", headers);
  
      // Define required headers that match your Leads schema:
      // Our Leads table uses: first_name, last_name, email, ig_username
      const requiredHeaders = ['first_name', 'last_name', 'email', 'ig_username'];
      for (const header of requiredHeaders) {
        if (!headers.includes(header)) {
          return res.status(400).json({
            success: false,
            message: `Missing required column: ${header}`
          });
        }
      }
  
      const rows = values.slice(1);
      let importedCount = 0;
      let associatedCount = 0;
  
      for (const row of rows) {
        // Map each row to an object using headers:
        const leadData = {};
        headers.forEach((header, index) => {
          leadData[header] = row[index];
        });
  
        // Validate required fields
        if (!leadData.first_name || !leadData.last_name || !leadData.email || !leadData.ig_username) {
          console.log("Skipping row, missing required fields:", leadData);
          continue;
        }
  
        // Check if a lead with the same email already exists
        let lead = await Lead.findOne({ where: { email: leadData.email } });
        if (!lead) {
          // Create a new lead record
          lead = await Lead.create({
            // If you have user authentication, use req.user.id. Otherwise, default to 1.
            user_id: req.user ? req.user.id : 1,
            first_name: leadData.first_name,
            last_name: leadData.last_name,
            email: leadData.email,
            ig_username: leadData.ig_username,
            lead_status: 'new'
          });
          importedCount++;
        }
  
        // Create an association in CampaignLeads if one doesn't exist
        const existingAssociation = await CampaignLeads.findOne({
          where: { campaign_id: campaignId, lead_id: lead.id }
        });
        if (!existingAssociation) {
          await CampaignLeads.create({ campaign_id: campaignId, lead_id: lead.id });
          associatedCount++;
        }
      }

      // After processing, fetch all campaign leads for this campaign including lead details
    // const campaignLeads = await CampaignLeads.findAll({
    //     where: { campaign_id: campaignId },
    //     include: [{ model: Lead }]
    //   });
  
      res.json({
        success: true,
        message: `Imported ${importedCount} new leads and associated ${associatedCount} leads with campaign ${campaignId}.`,
        campaignLeads: values
      });
    } catch (error) {
      console.error("Error importing leads from sheets:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

module.exports = router;
