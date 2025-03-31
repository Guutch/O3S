// index.js
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

// Import models
const SendingAccount = require('../src/models/SendingAccs');
const User = require('../src/models/User');
const Campaign = require('../src/models/Campaign');
const Lead = require('../src/models/Lead');
const Sequence = require('../src/models/Sequence');
const MessageLog = require('../src/models/MessageLog');
const ActivityLog = require('../src/models/ActivityLogs');
const InstagramAccount = require('../src/models/InstagramAccount');
const CampaignLead = require('../src/models/CampaignLead');
const CampaignSchedule = require('../src/models/CampaignSchedule');
const CampaignSequence = require('../src/models/CampaignSequence');

// Gather models in an object
const models = {
  SendingAccount,
  User,
  Campaign,
  Lead,
  Sequence,
  MessageLog,
  ActivityLog,
  InstagramAccount,
  CampaignLead,
  CampaignSchedule,
  CampaignSequence,
};

// Initialize each model and store in db
Object.keys(models).forEach((modelName) => {
  if (typeof models[modelName].init === "function") {
    models[modelName].init(sequelize, Sequelize);
  }
  db[modelName] = models[modelName];
});

// Run associations if defined
Object.keys(models).forEach((modelName) => {
  if (typeof models[modelName].associate === "function") {
    models[modelName].associate(db);
  }
});

// Sync database (optional)
sequelize
  .sync()
  .then(() => console.log("✅ Database synced successfully"))
  .catch((err) => console.error("❌ Database sync error:", err));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Map MessageLog to MessageLogs so that db.MessageLogs is defined.
db.MessageLogs = db.MessageLog;

console.log("✅ Models exported.");
module.exports = db;
