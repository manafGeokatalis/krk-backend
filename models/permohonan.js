'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class permohonan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.permohonan.belongsTo(models.provinsi);
      models.permohonan.belongsTo(models.kabupaten);
      models.permohonan.belongsTo(models.kecamatan);
      models.permohonan.belongsTo(models.kelurahan, { foreignKey: 'desa_id' });
      models.permohonan.belongsTo(models.provinsi, { foreignKey: 'lokasi_provinsi_id', as: 'lokasi_provinsi' });
      models.permohonan.belongsTo(models.kabupaten, { foreignKey: 'lokasi_kabupaten_id', as: 'lokasi_kabupaten' });
      models.permohonan.belongsTo(models.kecamatan, { foreignKey: 'lokasi_kecamatan_id', as: 'lokasi_kecamatan' });
      models.permohonan.belongsTo(models.kelurahan, { foreignKey: 'lokasi_desa_id', as: 'lokasi_kelurahan' });
      models.permohonan.belongsTo(models.user);
      models.permohonan.belongsTo(models.user, { foreignKey: 'staff_id', as: 'staff' });
      models.permohonan.hasMany(models.permohonan_progress);
    }
  }
  permohonan.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    wa: DataTypes.STRING,
    wa_kuasa: DataTypes.STRING,
    provinsi_id: DataTypes.BIGINT,
    kabupaten_id: DataTypes.BIGINT,
    kecamatan_id: DataTypes.BIGINT,
    desa_id: DataTypes.BIGINT,
    alamat: DataTypes.TEXT,
    lokasi_provinsi_id: DataTypes.BIGINT,
    lokasi_kabupaten_id: DataTypes.BIGINT,
    lokasi_kecamatan_id: DataTypes.BIGINT,
    lokasi_desa_id: DataTypes.BIGINT,
    lokasi_alamat: DataTypes.TEXT,
    npwp: DataTypes.STRING,
    coordinate: DataTypes.STRING,
    luas_tanah: DataTypes.INTEGER,
    status_tanah: DataTypes.STRING,
    fungsi_bangunan: DataTypes.STRING,
    ktp: DataTypes.STRING,
    pbb: DataTypes.STRING,
    surat_kuasa_mengurus: DataTypes.STRING,
    sertifikat_tanah: DataTypes.STRING,
    skpt: DataTypes.STRING,
    suket_tidak_sengketa: DataTypes.STRING,
    surat_perjanjian: DataTypes.STRING,
    rekom_ketinggian_bangunan: DataTypes.STRING,
    persetujuan_walikota: DataTypes.STRING,
    registration_number: DataTypes.STRING,
    staff_id: DataTypes.BIGINT,
    user_id: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'permohonan',
    underscored: true
  });
  return permohonan;
};