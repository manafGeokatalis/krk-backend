'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Feedback.belongsTo(models.user, { foreignKey: 'user_id', as: 'user' });
    }
  }
  Feedback.init({
    feedback: DataTypes.TEXT,
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'user', // Assuming there is a 'Users' table for foreign key reference
        key: 'id',
      },
      onDelete: 'CASCADE', // Optional: defines what happens on user deletion
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Min rating is 1
        max: 5, // Max rating is 5
      },
    },
  }, {
    sequelize,
    modelName: 'feedbacks',
    underscored: true
  });
  return Feedback;
};