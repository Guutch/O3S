const express = require('express');
const router = express.Router();
const CampaignSchedule = require('../models/CampaignSchedule');

// Get all schedules (optionally filtered by campaignId)
router.get('/', async (req, res) => {
  const { campaignId } = req.query;
  try {
    const schedules = campaignId
      ? await CampaignSchedule.findAll({ where: { campaign_id: campaignId } })
      : await CampaignSchedule.findAll();
    res.json(schedules);
  } catch (error) {
    console.error("Error fetching campaign schedules:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new schedule
router.post('/', async (req, res) => {
  const { campaign_id, schedule_name, from_time, to_time, timezone, days } = req.body;
  try {
    const schedule = await CampaignSchedule.create({
      campaign_id,
      schedule_name,
      from_time,
      to_time,
      timezone,
      days,
    });
    res.status(201).json(schedule);
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update an existing schedule
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { campaign_id, schedule_name, from_time, to_time, timezone, days } = req.body;
  try {
    const schedule = await CampaignSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    schedule.campaign_id = campaign_id;
    schedule.schedule_name = schedule_name;
    schedule.from_time = from_time;
    schedule.to_time = to_time;
    schedule.timezone = timezone;
    schedule.days = days;
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const schedule = await CampaignSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    await schedule.destroy();
    res.json({ message: "Schedule deleted" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
