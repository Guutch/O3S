const { Model, DataTypes } = require('sequelize');

class CampaignSchedule extends Model {
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
      schedule_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      from_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      to_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Storing selected days as an array of strings (Postgres supports this)
      days: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
    }, {
      sequelize,
      modelName: 'CampaignSchedule',
      tableName: 'CampaignSchedules',
      timestamps: true,
      underscored: true,
    });
  }
}

module.exports = CampaignSchedule;
