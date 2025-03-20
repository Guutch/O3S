// // backend/src/models/Lead.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// const Lead = sequelize.define('Lead', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     user_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     first_name: {
//         type: DataTypes.STRING,
//     },
//     last_name: {
//         type: DataTypes.STRING,
//     },
//     email: {
//         type: DataTypes.STRING,
//     },
//     ig_username: {
//         type: DataTypes.STRING,
//     },
//     lead_status: {
//         type: DataTypes.STRING,
//         defaultValue: 'new',
//     },
// }, {
//     tableName: 'Leads',
//     timestamps: true,
//     underscored: true, // Force Sequelize to use snake_case (created_at, updated_at)
//     freezeTableName: true, // Prevent automatic pluralization
// });

// module.exports = Lead;
const { Model, DataTypes } = require('sequelize');

class Lead extends Model {
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
            first_name: {
                type: DataTypes.STRING,
            },
            last_name: {
                type: DataTypes.STRING,
            },
            email: {
                type: DataTypes.STRING,
            },
            ig_username: {
                type: DataTypes.STRING,
            },
            lead_status: {
                type: DataTypes.STRING,
                defaultValue: 'new',
            },
            last_contacted_at: {  // ✅ ADD THIS FIELD
                type: DataTypes.DATE,
                allowNull: true,
            }
        }, {
            sequelize,
            modelName: 'Lead',
            tableName: 'Leads',
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        });
    }

    static associate(models) {
        this.belongsToMany(models.Campaign, {
            through: models.CampaignLead,
            foreignKey: 'lead_id',
            otherKey: 'campaign_id',
            as: 'campaigns',
        });
    }
}

module.exports = Lead;
