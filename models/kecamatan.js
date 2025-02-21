'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kecamatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      kecamatan.hasMany(models.kelurahan, { foreignKey: 'kecamatan_id' });
      kecamatan.belongsTo(models.kabupaten, { foreignKey: 'kabupaten_id' });
      // define association here
    }
  }
  kecamatan.init({
    kabupaten_id: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'kecamatan',
    underscored: true,
  });
  return kecamatan;
};