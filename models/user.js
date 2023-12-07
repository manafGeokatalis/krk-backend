'use strict';
const { hashSync } = require('bcrypt');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('password', hashSync(value, 10));
      }
    },
    role: DataTypes.CHAR,
    id_number: DataTypes.STRING,
    wa_number: DataTypes.STRING,
    address: DataTypes.TEXT,
    email_verified_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'user',
    underscored: true,
  });
  return user;
};