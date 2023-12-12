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
}

module.exports = new LocationServices;