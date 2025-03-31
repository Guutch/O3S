const { Model, DataTypes } = require('sequelize');

class MessageLog extends Model {
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
            sequence_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            lead_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            send_status: {
                type: DataTypes.STRING,
                defaultValue: 'pending',
            },
            opened_at: {
                type: DataTypes.DATE,
            },
            replied_at: {
                type: DataTypes.DATE,
            },
            booked_call_at: {
                type: DataTypes.DATE,
            },
            closed_at: {
                type: DataTypes.DATE,
            },
            sent_at: {
                type: DataTypes.DATE,
            },
        }, {
            sequelize, // ✅ Pass Sequelize instance
            modelName: 'MessageLog', // ✅ Set model name
            tableName: 'MessageLogs', // ✅ Ensure this matches DB
            timestamps: true,
            underscored: true,
        });
    }
}

module.exports = MessageLog;

