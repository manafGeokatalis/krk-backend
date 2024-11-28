'use strict';
const { readFile } = require('fs/promises');
const db = require('../models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const dir = './seeders//wilayah';
      const provinsiFile = await readFile(`${dir}/provinsi.json`, 'utf-8');
      const provinsiData = JSON.parse(provinsiFile);
      for (const provinsi of provinsiData) {
        await db.provinsi.create({
          id: provinsi.id,
          name: provinsi.nama,
        });
        const kabupatenFile = await readFile(`${dir}/kabupaten/${provinsi.id}.json`);
        const kabupatenData = JSON.parse(kabupatenFile);
        for (const kabupaten of kabupatenData) {
          await db.kabupaten.create({
            id: kabupaten.id,
            name: kabupaten.nama.replace('KAB.', '').trim(),
            provinsi_id: provinsi.id,
          });
          const kecamatanFile = await readFile(`${dir}/kecamatan/${kabupaten.id}.json`);
          const kecamatanData = JSON.parse(kecamatanFile);
          for (const kecamatan of kecamatanData) {
            await db.kecamatan.create({
              id: kecamatan.id,
              name: kecamatan.nama,
              kabupaten_id: kabupaten.id,
            });
            const kelurahanFile = await readFile(`${dir}/kelurahan/${kecamatan.id}.json`);
            const kelurahanData = JSON.parse(kelurahanFile);
            for (const kelurahan of kelurahanData) {
              await db.kelurahan.create({
                id: kelurahan.id,
                name: kelurahan.nama,
                kecamatan_id: kecamatan.id,
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    db.provinsi.truncate();
    db.kabupaten.truncate();
    db.kecamatan.truncate();
    db.kelurahan.truncate();
  }
};
