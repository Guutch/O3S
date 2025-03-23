// ROUND 3 //'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config(); // Load environment variables

console.log("🔍 Initializing Sequelize...");
const env = process.env.NODE_ENV || 'development';
const config = require('../src/config/config.js')[env]; // Ensure correct config path
const db = {};

// Initialize Sequelize connection
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);
console.log("✅ Sequelize initialized.");

// Explicitly import models
const SendingAccount = require('../src/models/SendingAccs');
const User = require('../src/models/User');
const Campaign = require('../src/models/Campaign');
const Lead = require('../src/models/Lead');
const Sequence = require('../src/models/Sequence');
const MessageLog = require('../src/models/MessageLog');
const ActivityLog = require('../src/models/ActivityLogs');
const InstagramAccount = require('../src/models/InstagramAccount');
const CampaignLead = require('../src/models/CampaignLead'); // ✅ ADD THIS LINE

// List all models
const models = {
    SendingAccount,
    User,
    Campaign,
    Lead,
    Sequence,
    MessageLog,
    ActivityLog,
    InstagramAccount,
    CampaignLead, // ✅ ADD THIS TO THE MODELS LIST
};

// **Initialize each model properly**
Object.keys(models).forEach((modelName) => {
    if (models[modelName].init) {
        // console.log(🔍 Initializing model: ${modelName});
        models[modelName].init(sequelize, Sequelize);
    }
    db[modelName] = models[modelName];
});
// InstagramAccount.init(sequelize);

console.log("✅ All models initialized.");

// **Associate models if needed**
Object.keys(models).forEach((modelName) => {
    if (models[modelName].init) {
    //   console.log(🔍 Initializing model: ${modelName});
      models[modelName].init(sequelize, Sequelize.DataTypes);
    }
    db[modelName] = models[modelName];
  });

// Sync database (optional)
sequelize
    .sync()
    .then(() => console.log("✅ Database synced successfully"))
    .catch((err) => console.error("❌ Database sync error:", err));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log("✅ Models exported.");
module.exports = {db, InstagramAccount, SendingAccount: db.SendingAccount};
