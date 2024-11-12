'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('permohonans', 'status_tanah', {
      type: Sequelize.STRING,
      allowNull: true, // Optional, you can set this based on your needs
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('permohonans', 'status_tanah');
  }
};
