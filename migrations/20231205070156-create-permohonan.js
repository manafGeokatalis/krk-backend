'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permohonans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      uuid: {
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      wa: {
        type: Sequelize.STRING
      },
      wa_kuasa: {
        type: Sequelize.STRING
      },
      provinsi_id: {
        type: Sequelize.BIGINT
      },
      kabupaten_id: {
        type: Sequelize.BIGINT
      },
      kecamatan_id: {
        type: Sequelize.BIGINT
      },
      desa_id: {
        type: Sequelize.BIGINT
      },
      alamat: {
        type: Sequelize.TEXT
      },
      lokasi_provinsi_id: {
        type: Sequelize.BIGINT
      },
      lokasi_kabupaten_id: {
        type: Sequelize.BIGINT
      },
      lokasi_desa_id: {
        type: Sequelize.BIGINT
      },
      lokasi_alamat: {
        type: Sequelize.TEXT
      },
      npwp: {
        type: Sequelize.STRING
      },
      coordinate: {
        type: Sequelize.STRING
      },
      luas_tanah: {
        type: Sequelize.INTEGER
      },
      fungsi_bangunan: {
        type: Sequelize.STRING
      },
      ktp: {
        type: Sequelize.STRING
      },
      pbb: {
        type: Sequelize.STRING
      },
      surat_kuasa_mengurus: {
        type: Sequelize.STRING
      },
      sertifikat_tanah: {
        type: Sequelize.STRING
      },
      skpt: {
        type: Sequelize.STRING
      },
      suket_tidak_sengketa: {
        type: Sequelize.STRING
      },
      surat_perjanjian: {
        type: Sequelize.STRING
      },
      rekom_ketinggian_bangunan: {
        type: Sequelize.STRING
      },
      persetujuan_walikota: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'cascade'
      },
      staff_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'set null'
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
    await queryInterface.dropTable('permohonans');
  }
};