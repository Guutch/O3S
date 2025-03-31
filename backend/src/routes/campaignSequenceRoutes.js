const express = require('express');
const router = express.Router();
const CampaignSequence = require('../models/CampaignSequence');

// Get all sequences (optionally filtered by campaignId)
router.get('/', async (req, res) => {
  const { campaignId } = req.query;
  try {
    const sequences = campaignId
      ? await CampaignSequence.findAll({ where: { campaign_id: campaignId } })
      : await CampaignSequence.findAll();
    res.json(sequences);
  } catch (error) {
    console.error("Error fetching campaign sequences:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new sequence step
router.post('/', async (req, res) => {
  const { campaign_id, step_number, platform, subject, message_body, delay } = req.body;
  try {
    const sequence = await CampaignSequence.create({
      campaign_id,
      step_number,
      platform,
      subject,
      message_body,
      delay,
    });
    res.status(201).json(sequence);
  } catch (error) {
    console.error("Error creating sequence:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update an existing sequence step
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { campaign_id, step_number, platform, subject, message_body, delay } = req.body;
  try {
    const sequence = await CampaignSequence.findByPk(id);
    if (!sequence) {
      return res.status(404).json({ error: "Sequence not found" });
    }
    sequence.campaign_id = campaign_id;
    sequence.step_number = step_number;
    sequence.platform = platform;
    sequence.subject = subject;
    sequence.message_body = message_body;
    sequence.delay = delay;
    await sequence.save();
    res.json(sequence);
  } catch (error) {
    console.error("Error updating sequence:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a sequence step
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sequence = await CampaignSequence.findByPk(id);
    if (!sequence) {
      return res.status(404).json({ error: "Sequence not found" });
    }
    await sequence.destroy();
    res.json({ message: "Sequence deleted" });
  } catch (error) {
    console.error("Error deleting sequence:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
