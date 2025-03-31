const { Model, DataTypes } = require('sequelize');

class CampaignSequence extends Model {
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
      step_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      platform: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // For email sequences, subject will be used; for Instagram it can be null.
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      message_body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // Delay in minutes before this step is triggered.
      delay: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    }, {
      sequelize,
      modelName: 'CampaignSequence',
      tableName: 'CampaignSequences',
      timestamps: true,
      underscored: true,
    });
  }
}

module.exports = CampaignSequence;
