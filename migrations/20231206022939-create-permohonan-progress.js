'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permohonan_progresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      step: {
        type: Sequelize.SMALLINT
      },
      processed_on: {
        type: Sequelize.DATE
      },
      desc: {
        type: Sequelize.TEXT
      },
      file: {
        type: Sequelize.STRING
      },
      permohonan_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'permohonans',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permohonan_progresses');
  }
};