'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kabupaten extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      kabupaten.hasMany(models.kecamatan, { foreignKey: 'kabupaten_id' });

      // define association here
    }
  }
  kabupaten.init({
    provinsi_id: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'kabupaten',
    underscored: true,
  });
  return kabupaten;
};