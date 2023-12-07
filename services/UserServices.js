const db = require("../models");

class UserServices {
  async getByEmail(email) {
    return await db.user.findOne({ where: { email } });
  }
  async getById(id) {
    return await db.user.findOne({ where: { id } });
  }

  async store(data) {
    return await db.user.create(data);
  }
}

module.exports = new UserServices;