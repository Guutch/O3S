const express = require("express");
const router = express.Router();
const { MessageLog, Campaign } = require("../../models");
// const authenticate = require("../middleware/authenticate");

// GET /api/message-logs
// Retrieves all message logs for campaigns belonging to the authenticated user.
router.get("/:userId", async (req, res) => {
    try {
      // 1. Get all campaigns for the user
      const campaigns = await Campaign.findAll({
        where: { user_id: req.params.userId },
        attributes: ["id"]
      });
      const campaignIds = campaigns.map(c => c.id);
      console.log("Campaign IDs for user", req.params.userId, ":", campaignIds);
  
      // 2. Fetch message logs where campaign_id is in the user's campaigns list
      const logs = await MessageLog.findAll({
        where: {
          campaign_id: campaignIds
        },
        order: [["sent_at", "DESC"]]
      });
      res.json({ success: true, messageLogs: logs });
    } catch (err) {
      console.error("Error fetching message logs:", err);
      res.status(500).json({ error: "Failed to fetch message logs" });
    }
  });

module.exports = router;
