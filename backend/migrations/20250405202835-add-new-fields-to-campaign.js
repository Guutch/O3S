'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Campaigns', 'spreadsheet_id', {
      type: Sequelize.STRING, // ✅ Correct type
      allowNull: true,
    });

    // Add other new columns the same way
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Campaigns', 'spreadsheet_id');

    // Remove other new columns the same way
  }
};
