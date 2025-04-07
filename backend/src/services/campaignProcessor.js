// campaignProcessor.js
const db = require('../../models'); // Ensure this loads your models
const { Op } = require('sequelize');
const { sendInstagramMessage } = require('../instagram/instagramService');
const { sendEmail } = require('../services/googleService');

console.log("🔍 Checking DB models:", Object.keys(db));

// Processes all active campaigns (existing function)
async function processCampaigns() {
  console.log("🚀 Processing campaigns...");

  // 1️⃣ Fetch active campaigns
  const campaigns = await db.Campaign.findAll({ where: { is_active: true } });
  console.log(`Found ${campaigns.length} active campaign(s).`);

  for (let campaign of campaigns) {
    console.log(`🔍 Processing campaign: ${campaign.id}`);

    // 2️⃣ Get all sequence steps for this campaign, sorted by step number
    const sequences = await db.CampaignSequence.findAll({
      where: { campaign_id: campaign.id },
      order: [['step_number', 'ASC']]
    });
    console.log(`Found ${sequences.length} sequence step(s) for campaign ${campaign.id}.`);

    for (let sequence of sequences) {
      console.log(`📌 Checking Sequence Step ${sequence.step_number}`);

      // 3️⃣ Find leads who need this message
      const leads = await db.Lead.findAll({
        include: {
          model: db.Campaign,
          as: 'campaigns',
          where: { id: campaign.id },
          through: { attributes: [] }
        },
        where: {
          last_contacted_at: {
            [Op.or]: {
              [Op.eq]: null,
              // Assuming delay is in minutes.
              [Op.lte]: new Date(Date.now() - sequence.delay * 60000)
            }
          }
        }
      });
      console.log(`Found ${leads.length} lead(s) for sequence step ${sequence.step_number}.`);

      for (let lead of leads) {
        // 4️⃣ Check if the lead has replied before sending
        const hasReplied = await db.MessageLogs.findOne({
          where: { lead_id: lead.id, replied_at: { [Op.ne]: null } }
        });
        if (hasReplied) {
          console.log(`⏩ Skipping lead ${lead.id}, already replied.`);
          continue;
        }

        console.log(`📩 Sending message to lead ${lead.id}...`);

        // 5️⃣ Send message via the correct platform
        if (campaign.platform === 'instagram') {
          console.log(`Sending Instagram DM to ${lead.username} with message: "${sequence.message_body}"`);

          await sendInstagramMessage(lead.user_id, lead.username, sequence.message_body);
        } else if (campaign.platform === 'email') {
          console.log(`Sending Email to ${lead.email} with subject: "${sequence.subject || "Follow-Up"}" and message: "${sequence.message_body}"`);
          await sendEmail(lead.email, sequence.subject || "Follow-Up", sequence.message_body);
        } else {
          console.log(`⚠️ Unknown campaign platform: ${campaign.platform}`);
        }

        // 6️⃣ Log message in MessageLogs
        await db.MessageLogs.create({
          campaign_id: campaign.id,
          sequence_id: sequence.id,
          lead_id: lead.id,
          send_status: 'sent',
          sent_at: new Date()
        });
        console.log(`Logged message for lead ${lead.id}.`);

        // 7️⃣ Update lead's last contacted date
        await lead.update({ last_contacted_at: new Date() });
        console.log(`Updated last_contacted_at for lead ${lead.id}.`);

        // 8️⃣ Enforce sending limits (optional)
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay 2 seconds per message
      }
    }
  }
  console.log("✅ Campaign processing complete.");
}

// Processes a single campaign by its ID for the resume endpoint
// Processes a single campaign using the provided formattedLeads
async function processCampaignForCampaignId(campaignId, userId, formattedLeads) {
  console.log(`🚀 Processing campaign ${campaignId}...`);
  console.log("User ID:", userId);

  const campaign = await db.Campaign.findOne({ where: { id: campaignId } });
  if (!campaign) throw new Error("Campaign not found");
  console.log(`Found campaign ${campaign.id}.`);

  const sequences = await db.CampaignSequence.findAll({
    where: { campaign_id: campaign.id },
    order: [['step_number', 'ASC']]
  });
  console.log(`Found ${sequences.length} sequence step(s).`);

  let batchCount = 0, dailyCount = 0;
  const DAILY_LIMIT = 50;

  for (let sequence of sequences) {
    console.log(`📌 Processing Sequence Step ${sequence.step_number}`);
    console.log(`    Platform: ${sequence.platform}`);
    console.log(`    Subject: ${sequence.subject || "N/A"}`);
    console.log(`    Message: ${sequence.message_body}`);

    // Use the passed formattedLeads directly (assigning an ID if missing)
    const leads = formattedLeads.map((lead, index) => {
      if (!lead.id) lead.id = index + 1;
      return lead;
    });
    console.log(`Found ${leads.length} lead(s):`);
    leads.forEach(lead => {
      console.log(`    Lead ID: ${lead.id}, Email: ${lead.email}, IG: ${lead.ig_username}`);
    });

    for (let lead of leads) {
      if (dailyCount >= DAILY_LIMIT) {
        console.log("Daily limit reached. Pausing for 24 hours.");
        await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
        dailyCount = 0;
        batchCount = 0;
      }

      // Check if lead replied before sending
      const hasReplied = await db.MessageLogs.findOne({
        where: { lead_id: lead.id, replied_at: { [Op.ne]: null } }
      });
      if (hasReplied) {
        console.log(`⏩ Skipping lead ${lead.id} (already replied).`);
        continue;
      }

      console.log(`📩 Sending message to lead ${lead.id}...`);
      if (sequence.platform === 'instagram') {
        console.log(`    [Instagram] DM to ${lead.ig_username}: "${sequence.message_body}"`);
        await sendInstagramMessage(userId, lead.ig_username, sequence.message_body);
      } else if (sequence.platform === 'email') {
        console.log(`    [Email] Sending email to ${lead.email} with subject: "${sequence.subject || "Follow-Up"}" and message: "${sequence.message_body}"`);
        await sendEmail(lead.email, sequence.subject || "Follow-Up", sequence.message_body, userId);
      } else {
        console.log(`⚠️ Unknown sequence platform: ${sequence.platform}. Skipping send.`);
      }

      await db.MessageLogs.create({
        campaign_id: campaign.id,
        sequence_id: sequence.id,
        lead_id: lead.id,
        send_status: 'sent',
        sent_at: new Date()
      });
      console.log(`    Logged message for lead ${lead.id}.`);

      if (lead.last_contacted_at !== undefined) {
        await db.Lead.update(
          { last_contacted_at: new Date() },
          { where: { id: lead.id } }
        );
        console.log(`    Updated last_contacted_at for lead ${lead.id}.`);
      }

      batchCount++;
      dailyCount++;

      if (batchCount >= 10) {
        console.log("Batch limit reached. Pausing for 1 hour.");
        await new Promise(resolve => setTimeout(resolve, 60 * 60 * 1000));
        batchCount = 0;
      }
    }
  }

  console.log(`✅ Campaign processing complete for campaign ${campaignId}.`);
  return { success: true, message: "Campaign processing resumed." };
}

module.exports = { processCampaigns, processCampaignForCampaignId };
