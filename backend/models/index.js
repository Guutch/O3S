// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const process = require('process');
// require('dotenv').config(); // Ensure environment variables are loaded

// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(path.join(__dirname, '/../src/config/config.js'))[env];
// const db = {};

// let sequelize;
// if (config.use_env_variable) {
//     sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//     sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// console.log("Checking if SendingAccs.js exists:", __dirname + "/SendingAccs.js");

// // Explicitly require models to avoid undefined references
// // const SendingAccount = require('../src/models/SendingAccs')(sequelize, Sequelize.DataTypes);
// const SendingAccount = require('../src/models/SendingAccs');


// // Explicitly require models to avoid undefined references
// // const SendingAccount = require('./SendingAccs')(sequelize, Sequelize.DataTypes);

// // Auto-load all models in the directory
// fs.readdirSync(__dirname)
//     .filter(file => 
//         file.indexOf('.') !== 0 && 
//         file !== basename && 
//         file.slice(-3) === '.js' && 
//         file.indexOf('.test.js') === -1
//     )
//     .forEach(file => {
//         const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//         db[model.name] = model;
//     });

// // Register explicitly imported models
// db.SendingAccount = SendingAccount;

// // Associate models if needed
// Object.keys(db).forEach(modelName => {
//     if (db[modelName].associate) {
//         db[modelName].associate(db);
//     }
// });

// // Sync database (optional, only if you want models to auto-sync)
// sequelize.sync()
//     .then(() => console.log("✅ Database synced successfully"))
//     .catch(err => console.error("❌ Database sync error:", err));

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// console.log("🔍 Checking DB models at CHAR MIN:", Object.keys(db));

// module.exports = db;

// ROUND 2 //
// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const process = require('process');
// require('dotenv').config(); // Load environment variables

// console.log("🔍 Initializing Sequelize...");
// const env = process.env.NODE_ENV || 'development';
// const config = require(path.join(__dirname, '../src/config/config.js'))[env]; // Ensure correct config path
// const db = {};

// // Initialize Sequelize connection
// const sequelize = new Sequelize(
//     config.database,
//     config.username,
//     config.password,
//     config
// );
// console.log("✅ Sequelize initialized.");

// // Explicitly load models from `src/models/`
// const modelsPath = path.join(__dirname, '../src/models');
// console.log("🔍 Loading models from:", modelsPath);

// // Manually require models to avoid undefined references
// const models = {
//     SendingAccount: require(modelsPath + '/SendingAccs'),
//     Campaign: require(modelsPath + '/Campaign'),
//     InstagramAccount: require(modelsPath + '/InstagramAccount'),
//     Lead: require(modelsPath + '/Lead'),
//     Sequence: require(modelsPath + '/Sequence'),
//     MessageLog: require(modelsPath + '/MessageLog'),
//     ActivityLogs: require(modelsPath + '/ActivityLogs'),
//     User: require(modelsPath + '/User'),
// };

// // Initialize models
// Object.keys(models).forEach(modelName => {
//     console.log(`🔍 Initializing model: ${modelName}`);
//     db[modelName] = models[modelName](sequelize, Sequelize.DataTypes);
// });

// // Associate models if necessary
// Object.keys(db).forEach(modelName => {
//     if (db[modelName].associate) {
//         console.log(`🔗 Associating model: ${modelName}`);
//         db[modelName].associate(db);
//     }
// });

// // Sync database (optional)
// sequelize
//     .sync()
//     .then(() => console.log("✅ Database synced successfully"))
//     .catch((err) => console.error("❌ Database sync error:", err));

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// console.log("✅ Models exported.");
// console.log("🔍 Checking DB models:", Object.keys(db));

// module.exports = db;

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
module.exports = {db, InstagramAccount};
