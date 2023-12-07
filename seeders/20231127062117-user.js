'use strict';

const db = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    const email = 'admin@geokatalis.com';
    await db.user.destroy({ where: { email } });
    await db.user.create({
      name: 'Super Admin',
      email,
      password: 'gkPassword',
      role: 'SUPERADMIN',
      email_verified_at: new Date(),
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
