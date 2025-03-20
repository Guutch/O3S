'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('MessageLogs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sequence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      send_status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
      },
      opened_at: {
        type: Sequelize.DATE,
      },
      replied_at: {
        type: Sequelize.DATE,
      },
      booked_call_at: {
        type: Sequelize.DATE,
      },
      closed_at: {
        type: Sequelize.DATE,
      },
      sent_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('MessageLogs');
  }
};
