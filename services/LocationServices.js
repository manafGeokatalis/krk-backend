const { where } = require("sequelize");
const db = require("../models");

class LocationServices {
  async getProvinsi() {
    return await db.provinsi.findAll();
  }
  async getKabupaten(provinsi_id) {
    return await db.kabupaten.findAll({ where: { provinsi_id }, attributes: ['id', 'name'] });
  }
  async getKecamatan(kabupaten_id) {
    return await db.kecamatan.findAll({ where: { kabupaten_id }, attributes: ['id', 'name'] });
  }
  async getKelurahan(kecamatan_id) {
    return await db.kelurahan.findAll({ where: { kecamatan_id }, attributes: ['id', 'name'] });
  }

  async getKelurahanByKabupaten(kabupaten_id) {
    try {
      // const data = await db.kelurahan.findAll({
      //   attributes: [
      //     ['id', 'kelurahan_id'],
      //     ['name', 'kelurahan_name']
      //   ],
      //   include: [
      //     {
      //       model: db.kecamatan,
      //       attributes: [
      //         ['id', 'kecamatan_id'],
      //         ['name', 'kecamatan_name']
      //         ['kabupaten_id', 'kabupaten_id'],
      //       ],
      //       include: [
      //         {
      //           model: db.kabupaten,
      //           attributes: [['id', 'kabupaten_id']],
      //           where: {
      //             id: kabupaten_id
      //           }
      //         }
      //       ]
      //     }
      //   ]
      // })
      const sql = `SELECT kl.id AS kelurahan_id,kl.name AS kelurahan_name,kc.id AS kecamatan_id,kc.name AS kecamatan_name,kb.id AS kabupaten_id FROM pkkpr.kelurahans kl LEFT JOIN pkkpr.kecamatans kc ON kl.kecamatan_id = kc.id LEFT JOIN pkkpr.kabupatens kb ON kc.kabupaten_id = kb.id WHERE 
      kb.id = :kabupatenId
`;
      const replacements = { kabupatenId: 5315 };
      const kelurahanData = await db.sequelize.query(sql, {
        type: db.Sequelize.QueryTypes.SELECT, // Ensures the query returns raw objects,
        replacements
      });

      return {
        data: kelurahanData
      }
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = new LocationServices;