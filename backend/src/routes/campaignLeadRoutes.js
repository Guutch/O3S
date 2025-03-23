const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Lead = require('../models/Lead');
const CampaignLeads = require('../models/CampaignLead');

// POST /api/campaign-leads
// This route creates a new CampaignLead record linking a campaign with a lead.
router.post('/', async (req, res) => {
    try {
      const { campaign_id, lead_id } = req.body;
      if (!campaign_id || !lead_id) {
        return res.status(400).json({ error: "campaign_id and lead_id are required." });
      }
  
      // Create a new record in CampaignLeads
      const newCampaignLead = await CampaignLeads.create({ campaign_id, lead_id });
      return res.status(201).json({ 
        success: true, 
        message: "Campaign lead added successfully", 
        id: newCampaignLead.id,
        newCampaignLead 
      });
    } catch (error) {
      console.error("Error adding campaign lead:", error);
      return res.status(500).json({ 
        error: "Failed to add campaign lead", 
        details: error.message 
      });
    }
  });

  // GET /api/campaign-leads/:campaignId
router.get('/:campaignId', async (req, res) => {
    try {
      const campaignLeads = await CampaignLeads.findAll({
        where: { campaign_id: req.params.campaignId },
      });
      res.json(campaignLeads);
    } catch (error) {
      console.error("Error fetching campaign leads:", error);
      res.status(500).json({ error: "Failed to fetch campaign leads" });
    }
  });
  
  
  module.exports = router;