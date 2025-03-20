// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db'); // Ensure this is correct

// class SendingAccount extends Model {}

// const SendingAccount = sequelize.define('SendingAccount', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     user_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     platform: {
//         type: DataTypes.STRING, // 'email' or 'instagram'
//         allowNull: false,
//     },
//     account_identifier: {
//         type: DataTypes.STRING, // email address or IG username
//         unique: true,
//         allowNull: false,
//     },
//     access_token: {
//         type: DataTypes.TEXT, // Store securely (e.g., OAuth token for email/IG API)
//         allowNull: false,
//     },
//     is_active: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: true,
//     },
// }, {
//     timestamps: true, // Auto-generates createdAt & updatedAt
//     tableName: 'SendingAccounts', // Ensure this matches the actual table name in the database
//     underscored: true,
// });

// module.exports = SendingAccount;

// ROUND 2
// const { Model, DataTypes } = require('sequelize');
// const sequelize = require('../config/db'); // Ensure correct database connection

// class SendingAccount extends Model {}

// SendingAccount.init({
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     user_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     platform: {
//         type: DataTypes.STRING, // 'email' or 'instagram'
//         allowNull: false,
//     },
//     account_identifier: {
//         type: DataTypes.STRING, // email address or IG username
//         unique: true,
//         allowNull: false,
//     },
//     access_token: {
//         type: DataTypes.TEXT, // Store securely (e.g., OAuth token for email/IG API)
//         allowNull: false,
//     },
//     is_active: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: true,
//     },
// }, {
//     sequelize, // Pass the Sequelize instance
//     modelName: 'SendingAccount', // Name of the model
//     tableName: 'SendingAccounts', // Ensure this matches your database
//     timestamps: true, // Auto-generates createdAt & updatedAt
//     underscored: true,
// });

// module.exports = SendingAccount;

//  ROUND 3
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class SendingAccount extends Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            platform: {
                type: DataTypes.STRING, // 'email' or 'instagram'
                allowNull: false,
            },
            account_identifier: {
                type: DataTypes.STRING, // email address or IG username
                unique: true,
                allowNull: false,
            },
            access_token: {
                type: DataTypes.TEXT, // Store securely (e.g., OAuth token for email/IG API)
                allowNull: false,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        }, {
            sequelize, // ✅ Pass Sequelize instance
            modelName: 'SendingAccount', // ✅ Set model name
            tableName: 'SendingAccounts', // ✅ Ensure this matches DB
            timestamps: true,
            underscored: true,
        });
    }
}

// ✅ Initialize the model
SendingAccount.init(sequelize);

module.exports = SendingAccount;
