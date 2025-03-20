const { Model, DataTypes } = require('sequelize');

class CampaignLead extends Model {
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
                    model: 'Campaigns',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            lead_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Leads',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
        }, {
            sequelize,
            modelName: 'CampaignLead',
            tableName: 'CampaignLeads',
            timestamps: true,
            underscored: true,
        });
    }
}

module.exports = CampaignLead;
