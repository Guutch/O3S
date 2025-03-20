// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db'); // Ensure this points to your DB connection

// const ActivityLog = sequelize.define('ActivityLog', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     campaign_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     lead_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     platform: {
//         type: DataTypes.STRING, // 'email', 'instagram'
//         allowNull: false,
//     },
//     event_type: {
//         type: DataTypes.STRING, // 'reply', 'bounce', 'dm_blocked'
//         allowNull: false,
//     },
//     event_data: {
//         type: DataTypes.JSONB, // Flexible data storage for additional API details
//         allowNull: true,
//     },
//     recorded_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     }
// }, {
//     timestamps: false, // We're handling timestamps manually
// });

// module.exports = ActivityLog;
const { Model, DataTypes } = require('sequelize');

class ActivityLog extends Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            campaign_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            lead_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            platform: {
                type: DataTypes.STRING, // 'email', 'instagram'
                allowNull: false,
            },
            event_type: {
                type: DataTypes.STRING, // 'reply', 'bounce', 'dm_blocked'
                allowNull: false,
            },
            event_data: {
                type: DataTypes.JSONB, // Flexible data storage for additional API details
                allowNull: true,
            },
            recorded_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            sequelize, // ✅ Pass Sequelize instance
            modelName: 'ActivityLog', // ✅ Set model name
            tableName: 'ActivityLogs', // ✅ Ensure this matches DB
            timestamps: false, // ✅ Manual timestamps
            underscored: true,
        });
    }
}

module.exports = ActivityLog;

