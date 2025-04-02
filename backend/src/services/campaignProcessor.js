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
async function processCampaignForCampaignId(campaignId, userId) {
  console.log(`🚀 Processing campaign ${campaignId}...`);
  console.log()
  console.log("This is UserID", userId)
  console.log()

  // Retrieve the campaign by ID
  const campaign = await db.Campaign.findOne({ where: { id: campaignId } });
  if (!campaign) {
    throw new Error("Campaign not found");
  }
  console.log(`Found campaign ${campaign.id}. (Campaign table doesn't store platform info.)`);

  // Get all sequence steps for this campaign, sorted by step number
  const sequences = await db.CampaignSequence.findAll({
    where: { campaign_id: campaign.id },
    order: [['step_number', 'ASC']]
  });
  console.log(`Found ${sequences.length} sequence step(s) for campaign ${campaign.id}.`);

  for (let sequence of sequences) {
    console.log(`📌 Processing Sequence Step ${sequence.step_number} for campaign ${campaignId}.`);
    console.log(`    Platform: ${sequence.platform}`);
    console.log(`    Subject: ${sequence.subject || "N/A"}`);
    console.log(`    Message Body: ${sequence.message_body}`);
    console.log(`    Delay (minutes): ${sequence.delay}`);

    // Fetch leads from the Google Sheet endpoint for this campaign using POST
    try {
      console.log("before leads response");
      const leadsResponse = await fetch(`http://localhost:5000/api/leads/import-sheets/${campaign.id}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
      });
      const leadsData = await leadsResponse.json();
      console.log("THIS IS LEADS", leadsData);

      // Convert the sheet array into objects:
      // Expecting: { campaignLeads: [ [header1, header2, ...], [data1, data2, ...], ... ] }
      const sheetRows = leadsData.campaignLeads;
      if (!sheetRows || sheetRows.length < 2) {
        console.log("No data rows available from Google Sheets.");
        continue;
      }
      const headers = sheetRows[0];
      const leads = sheetRows.slice(1).map((row, index) => {
        let leadObj = {};
        headers.forEach((header, i) => {
          leadObj[header] = row[i];
        });
        // Optionally assign an ID if not provided
        leadObj.id = index + 1;
        return leadObj;
      });

      console.log(`Found ${leads.length} lead(s) for sequence step ${sequence.step_number}:`);
      leads.forEach(lead => {
        console.log(`    Lead ID: ${lead.id}, Email: ${lead.email}, IG Username: ${lead.ig_username}`);
      });

      // Inside your processCampaignForCampaignId function...
      // Initialize counters before looping through leads
      let batchCount = 0;
      let dailyCount = 0;
      const DAILY_LIMIT = 50; // or use a variable if needed

      for (let lead of leads) {
        // Check if daily limit reached; if so, pause for 24 hours.
        if (dailyCount >= DAILY_LIMIT) {
          console.log("Daily limit reached. Pausing for 24 hours.");
          await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
          dailyCount = 0;
          batchCount = 0;
        }
      
        // Check if the lead has replied before sending.
        const hasReplied = await db.MessageLogs.findOne({
          where: { lead_id: lead.id, replied_at: { [Op.ne]: null } }
        });
        if (hasReplied) {
          console.log(`⏩ Skipping lead ${lead.id} because they already replied.`);
          continue;
        }
        console.log(`📩 Sending message to lead ${lead.id}...`);
      
        // Send message based on the sequence's platform.
        if (sequence.platform === 'instagram') {
          console.log(`    [Instagram] Sending DM to ${lead.ig_username} with message: "${sequence.message_body}"`);
          // Wait for sendInstagramMessage to complete (and close the browser) before proceeding.
          await sendInstagramMessage(userId, lead.ig_username, sequence.message_body);
        }
        /* else if (sequence.platform === 'email') {
          console.log(`    [Email] Sending email to ${lead.email} with subject: "${sequence.subject || "Follow-Up"}" and message: "${sequence.message_body}"`);
          console.log("Using passed userId for email sending:", userId);
          await sendEmail(lead.email, sequence.subject || "Follow-Up", sequence.message_body, userId);
        } else {
          console.log(`⚠️ Unknown sequence platform: ${sequence.platform}. Skipping send.`);
        } */
      
        // Log the sent message in MessageLogs.
        await db.MessageLogs.create({
          campaign_id: campaign.id,
          sequence_id: sequence.id,
          lead_id: lead.id,
          send_status: 'sent',
          sent_at: new Date()
        });
        console.log(`    Logged message for lead ${lead.id}.`);
      
        // Optionally, update the lead's last_contacted date if available.
        if (lead.last_contacted_at !== undefined) {
          await db.Lead.update(
            { last_contacted_at: new Date() },
            { where: { id: lead.id } }
          );
          console.log(`    Updated last_contacted_at for lead ${lead.id}.`);
        }
      
        // Increment counters.
        batchCount++;
        dailyCount++;
      
        // After processing the lead, wait 20 seconds before moving on.
        // console.log("Waiting 20 seconds before processing next lead.");
        // await new Promise(resolve => setTimeout(resolve, 20000));
      
        // If 10 DMs have been sent in this batch, pause for 1 hour then reset the batch counter.
        if (batchCount >= 10) {
          console.log("Batch limit reached. Pausing for 1 hour.");
          await new Promise(resolve => setTimeout(resolve, 60 * 60 * 1000));
          batchCount = 0;
        }
      }
      


    } catch (err) {
      console.error(`❌ Error fetching leads from Google Sheets for campaign ${campaign.id}:`, err);
    }
  }

  console.log(`✅ Campaign processing complete for campaign ${campaignId}.`);
  return { success: true, message: "Campaign processing resumed." };
}



module.exports = { processCampaigns, processCampaignForCampaignId };
