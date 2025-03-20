// // backend/src/models/Campaign.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// const Campaign = sequelize.define('Campaign', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     user_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     channel: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     is_active: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: true,
//     },
//     daily_limit: {
//         type: DataTypes.INTEGER,
//         defaultValue: 25,
//     },
//     slow_ramp_enabled: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//     },
//     random_delay_min: {
//         type: DataTypes.INTEGER,
//         defaultValue: 30,
//     },
//     random_delay_max: {
//         type: DataTypes.INTEGER,
//         defaultValue: 90,
//     },
// }, {
//     timestamps: true,
//     underscored: true,
//     tableName: 'Campaigns',
// });

// module.exports = Campaign;
const { Model, DataTypes } = require('sequelize');

class Campaign extends Model {
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
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            channel: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            daily_limit: {
                type: DataTypes.INTEGER,
                defaultValue: 25,
            },
            slow_ramp_enabled: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            random_delay_min: {
                type: DataTypes.INTEGER,
                defaultValue: 30,
            },
            random_delay_max: {
                type: DataTypes.INTEGER,
                defaultValue: 90,
            },
        }, {
            sequelize,
            modelName: 'Campaign',
            tableName: 'Campaigns',
            timestamps: true,
            underscored: true,
        });
    }

    static associate(models) {
        this.belongsToMany(models.Lead, {
            through: models.CampaignLead,
            foreignKey: 'campaign_id',
            otherKey: 'lead_id',
            as: 'leads',
        });
    }
}

module.exports = Campaign;


