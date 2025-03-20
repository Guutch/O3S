const { processCampaigns } = require('../services/campaignProcessor');

(async () => {
    console.log("🚀 Manually Running Campaign Processor...");
    await processCampaigns();
    console.log("✅ Campaign processing complete.");
    process.exit();
})();
