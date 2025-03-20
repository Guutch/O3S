'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sequences', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      step_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      subject: {
        type: Sequelize.TEXT,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      delay_days: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      variation_label: {
        type: Sequelize.STRING,
      },
      like_before_dm: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      comment_before_dm: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      follow_before_dm: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      comment_text: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sequences');
  }
};
