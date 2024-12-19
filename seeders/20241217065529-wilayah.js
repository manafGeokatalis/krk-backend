'use strict';
const { readFile } = require('fs/promises');
const db = require('../models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('provinsis', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('kabupatens', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('kecamatans', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('kelurahans', null, { truncate: true, cascade: true, restartIdentity: true });

    try {
      const dir = './seeders/wilayah';
      const provinsiFile = await readFile(`${dir}/provinsi.json`, 'utf-8');
      const provinsiData = JSON.parse(provinsiFile);

      // Create an array to store provinsi data for bulk insert
      const provinsiToInsert = [];
      for (const provinsi of provinsiData) {
        provinsiToInsert.push({
          id: provinsi.id,
          name: provinsi.nama,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      await db.provinsi.bulkCreate(provinsiToInsert);

      for (const provinsi of provinsiData) {
        const kabupatenFile = await readFile(`${dir}/kabupaten/${provinsi.id}.json`);
        const kabupatenData = JSON.parse(kabupatenFile);

        // Create an array to store kabupaten data for bulk insert
        const kabupatenToInsert = [];
        for (const kabupaten of kabupatenData) {
          kabupatenToInsert.push({
            id: kabupaten.id,
            name: kabupaten.nama.replace('KAB.', '').trim(),
            provinsi_id: provinsi.id,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }

        // Bulk insert kabupaten data
        await db.kabupaten.bulkCreate(kabupatenToInsert);

        // Loop through the kabupatenData and process kecamatan, kelurahan
        for (const kabupaten of kabupatenData) {
          const kecamatanFile = await readFile(`${dir}/kecamatan/${kabupaten.id}.json`);
          const kecamatanData = JSON.parse(kecamatanFile);

          // Create an array to store kecamatan data for bulk insert
          const kecamatanToInsert = [];
          for (const kecamatan of kecamatanData) {
            kecamatanToInsert.push({
              id: kecamatan.id,
              name: kecamatan.nama,
              kabupaten_id: kabupaten.id,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }

          // Bulk insert kecamatan data
          await db.kecamatan.bulkCreate(kecamatanToInsert);

          // Loop through the kecamatanData and process kelurahan
          for (const kecamatan of kecamatanData) {
            const kelurahanFile = await readFile(`${dir}/kelurahan/${kecamatan.id}.json`);
            const kelurahanData = JSON.parse(kelurahanFile);

            // Create an array to store kelurahan data for bulk insert
            const kelurahanToInsert = [];
            for (const kelurahan of kelurahanData) {
              kelurahanToInsert.push({
                id: kelurahan.id,
                name: kelurahan.nama,
                kecamatan_id: kecamatan.id,
                created_at: new Date(),
                updated_at: new Date(),
              });
            }

            // Bulk insert kelurahan data
            await db.kelurahan.bulkCreate(kelurahanToInsert);
          }
        }
      }


    } catch (error) {
      console.log(error)
    }
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('provinsis', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('kabupatens', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('kecamatans', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('kelurahans', null, { truncate: true, cascade: true, restartIdentity: true });
    // await queryInterface.bulkDelete('provinsis', null, { truncate: true, cascade: true, restartIdentity: true });
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
