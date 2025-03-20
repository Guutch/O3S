'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ActivityLogs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      platform: {
        type: Sequelize.STRING, // 'email', 'instagram'
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING, // 'reply', 'bounce', 'dm_blocked'
        allowNull: false,
      },
      event_data: {
        type: Sequelize.JSONB, // Flexible data storage for additional API details
        allowNull: true,
      },
      recorded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivityLogs');
  }
};
