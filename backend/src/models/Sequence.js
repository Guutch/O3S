// // backend/src/models/Sequence.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');
// const Campaign = require('./Campaign'); // Import Campaign model

// const Sequence = sequelize.define('Sequence', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     campaign_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//             model: 'Campaigns', // Ensures foreign key constraint
//             key: 'id'
//         },
//         onDelete: 'CASCADE' // Ensures sequences get deleted if the campaign is removed
//     },
//     step_order: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     subject: {
//         type: DataTypes.TEXT,
//     },
//     body: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//     },
//     delay_days: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//     },
//     variation_label: {
//         type: DataTypes.STRING,
//     },
//     like_before_dm: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//     },
//     comment_before_dm: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//     },
//     follow_before_dm: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//     },
//     comment_text: {
//         type: DataTypes.TEXT,
//     },
// }, {
//     timestamps: true, // Ensures `createdAt` and `updatedAt` fields exist
// });

// // Define association: A sequence belongs to a campaign
// Sequence.belongsTo(Campaign, { foreignKey: 'campaign_id', onDelete: 'CASCADE' });

// module.exports = Sequence;
const { Model, DataTypes } = require('sequelize');

class Sequence extends Model {
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
                references: {
                    model: 'Campaigns', // Ensures foreign key constraint
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            step_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            subject: {
                type: DataTypes.TEXT,
            },
            body: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            delay_days: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            variation_label: {
                type: DataTypes.STRING,
            },
            like_before_dm: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            comment_before_dm: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            follow_before_dm: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            comment_text: {
                type: DataTypes.TEXT,
            },
        }, {
            sequelize, // ✅ Pass the Sequelize instance
            modelName: 'Sequence',
            tableName: 'Sequences',
            timestamps: true,
        });
    }

    static associate(models) {
        Sequence.belongsTo(models.Campaign, { foreignKey: 'campaign_id', onDelete: 'CASCADE' });
    }
}

module.exports = Sequence;

