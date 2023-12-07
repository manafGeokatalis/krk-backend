'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class permohonan_progress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  permohonan_progress.init({
    step: DataTypes.SMALLINT,
    processed_on: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    desc: DataTypes.TEXT,
    file: DataTypes.STRING,
    permohonan_id: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'permohonan_progress',
    underscored: true,
  });
  return permohonan_progress;
};