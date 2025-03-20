// Handles campaign execution
const db = require('../../models'); // Ensure this loads your models
const { Op } = require('sequelize');
const { sendInstagramMessage } = require('../instagram/instagramService');
const { sendEmail } = require('../services/googleService');

console.log("🔍 Checking DB models:", Object.keys(db));


async function processCampaigns() {
    console.log("🚀 Processing campaigns...");

    // 1️⃣ Fetch active campaigns
    const campaigns = await db.Campaign.findAll({ where: { is_active: true } });
    
    for (let campaign of campaigns) {
        console.log(`🔍 Processing campaign: ${campaign.id}`);

        // 2️⃣ Get all sequences for this campaign, sorted in order
        const sequences = await db.Sequence.findAll({
            where: { campaign_id: campaign.id },
            order: [['step_order', 'ASC']]
        });

        for (let sequence of sequences) {
            console.log(`📌 Checking Sequence Step ${sequence.step_order}`);

            // 3️⃣ Find leads who need this message
            const leads = await db.Lead.findAll({
                include: {
                    model: db.Campaign,
                    as: 'campaigns',
                    where: { id: campaign.id },
                    through: { attributes: [] } // Exclude join table attributes
                },
                where: {
                    last_contacted_at: {
                        [Op.or]: {
                            [Op.eq]: null,
                            [Op.lte]: new Date(Date.now() - sequence.delay_days * 86400000)
                        }
                    },
                    // status: 'active'
                }
            });
            

            for (let lead of leads) {
                // 4️⃣ Check if the lead has replied before sending
                const hasReplied = await db.MessageLogs.findOne({
                    where: { lead_id: lead.id, replied_at: { [Op.ne]: null } }
                });

                if (hasReplied) {
                    console.log(`⏩ Skipping lead ${lead.id}, already replied.`);
                    continue;
                }

                console.log(`📩 Sending message to lead ${lead.id}`);

                // 5️⃣ Send message via the correct platform
                if (campaign.platform === 'instagram') {
                    await sendInstagramMessage(lead.user_id, lead.username, sequence.body);
                } else if (campaign.platform === 'email') {
                    await sendEmail(lead.email, sequence.subject || "Follow-Up", sequence.body);
                }

                // 6️⃣ Log message in MessageLogs
                await db.MessageLogs.create({
                    campaign_id: campaign.id,
                    sequence_id: sequence.id,
                    lead_id: lead.id,
                    send_status: 'sent',
                    sent_at: new Date()
                });

                // 7️⃣ Update lead's last contacted date
                await lead.update({ last_contacted_at: new Date() });

                // 8️⃣ Enforce sending limits (optional)
                await new Promise(resolve => setTimeout(resolve, 2000)); // Delay 2 seconds per message
            }
        }
    }

    console.log("✅ Campaign processing complete.");
}

module.exports = { processCampaigns };
