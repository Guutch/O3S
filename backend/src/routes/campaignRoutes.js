const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { processCampaignForCampaignId } = require('../services/campaignProcessor');
const CampaignSequence = require('../models/CampaignSequence'); // New import
const CampaignSchedule = require('../models/CampaignSchedule'); // New import
const { readSheetData, readSheetDataById } = require('../services/sheetsService'); // Reads sheet data

// Middleware to verify JWT
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(401).json({ error: 'Invalid token' });
        
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Route to check connection to a Google Sheet by spreadsheet ID
router.get('/check-sheet/:spreadsheetId', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const sheetData = await readSheetDataById(spreadsheetId);
    if (sheetData && sheetData.length > 0) {
      return res.json({ success: true, data: sheetData });
    } else {
      return res.json({ success: false });
    }
  } catch (error) {
    console.error("Error checking sheet data:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});


// @route   GET /api/campaigns
// @desc    Get all campaigns for the authenticated user
router.get('/', authenticate, async (req, res) => {
    console.log("okay mate")
    try {
      const campaigns = await Campaign.findAll({
        where: { user_id: req.user.id },
        order: [
          ['is_active', 'DESC'],  // Active campaigns first
          ['created_at', 'ASC']   // Then ordered by creation time
        ]
      });
      res.json(campaigns);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  });

  // @route   GET /api/campaigns/sequences
// @desc    Get all campaign sequences (ignoring campaignId filter)
router.get('/sequences', authenticate, async (req, res) => {
  try {
    const sequences = await CampaignSequence.findAll();
    res.json(sequences);
  } catch (error) {
    console.error("Error fetching campaign sequences:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/schedules', authenticate, async (req, res) => {
  try {
    const schedules = await CampaignSchedule.findAll();
    res.json(schedules);
  } catch (error) {
    console.error("Error fetching campaign schedules:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET spreadsheet ID for a campaign
router.get('/:id/spreadsheet', authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ spreadsheetId: campaign.spreadsheet_id });
  } catch (error) {
    console.error("Error fetching spreadsheet ID:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Add spreadsheet ID to a campaign (only if not already set)
router.post('/:id/spreadsheet', authenticate, async (req, res) => {
  const { spreadsheetId } = req.body;
  try {
    const campaign = await Campaign.findOne({ 
      where: { id: req.params.id, user_id: req.user.id } 
    });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    if (campaign.spreadsheet_id) {
      return res.status(400).json({ error: 'Spreadsheet ID already exists. Use update instead.' });
    }
    
    campaign.spreadsheet_id = spreadsheetId;
    await campaign.save();
    res.json({ message: 'Spreadsheet ID added successfully', campaign });
  } catch (err) {
    console.error("Error adding spreadsheet ID:", err);
    res.status(500).json({ error: 'Failed to add spreadsheet ID' });
  }
});

// Update spreadsheet ID for a campaign
router.put('/:id/spreadsheet', authenticate, async (req, res) => {
  const { spreadsheetId } = req.body;
  try {
    const campaign = await Campaign.findOne({ 
      where: { id: req.params.id, user_id: req.user.id } 
    });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    campaign.spreadsheet_id = spreadsheetId;
    await campaign.save();
    res.json({ message: 'Spreadsheet ID updated successfully', campaign });
  } catch (err) {
    console.error("Error updating spreadsheet ID:", err);
    res.status(500).json({ error: 'Failed to update spreadsheet ID' });
  }
});

// @route   POST /api/campaigns
// @desc    Create a new campaign
router.post('/', authenticate, async (req, res) => {
    const { name, channel, is_active, daily_limit, slow_ramp_enabled, random_delay_min, random_delay_max } = req.body;
    try {
        console.log("Creating campaign with data:", req.body);
        console.log("Authenticated User ID:", req.user.id);

        const newCampaign = await Campaign.create({
            user_id: req.user.id,
            name,
            channel,
            is_active,
            daily_limit,
            slow_ramp_enabled,
            random_delay_min,
            random_delay_max,
        });

        console.log("New campaign created:", newCampaign);
        res.status(201).json(newCampaign);
    } catch (err) {
        console.error("Error creating campaign:", err);
        res.status(500).json({ error: 'Failed to creatEEEe campaign', details: err.message });
    }
});


// @route   GET /api/campaigns/:id
// @desc    Get a single campaign by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        res.json(campaign);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
});

// @route   PUT /api/campaigns/:id
// @desc    Update a campaign by ID
router.put('/:id', authenticate, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        
        await campaign.update(req.body);
        res.json(campaign);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete a campaign by ID
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        
        await campaign.destroy();
        res.json({ message: 'Campaign deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
});

// GET /api/campaign-leads/:campaignId
router.get('/:campaignId', async (req, res) => {
    try {
      const { campaignId } = req.params;
      // Assuming you have set up associations between CampaignLead and Lead
      const campaignLeads = await CampaignLead.findAll({
        where: { campaign_id: campaignId },
        include: [{ model: Lead }] // This assumes that you've defined the association
      });
      res.json({ success: true, campaignLeads });
    } catch (error) {
      console.error("Error fetching campaign leads:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

// POST /api/campaigns/:id/resume endpoint updated to pass spreadsheetId
router.post('/:id/resume', authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    
    const { userId, formattedLeads } = req.body;
    const result = await processCampaignForCampaignId(campaign.id, userId, formattedLeads);
    
    res.json(result);
  } catch (err) {
    console.error("Error resuming campaign:", err);
    res.status(500).json({ error: 'Failed to resume campaign processing' });
  }
});




module.exports = router;
