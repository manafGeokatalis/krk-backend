const db = require("../models");

class StatusServices {
  async getPermohonanDiproses() {
    try {
      return await db.permohonan.count({
        distinct: true,
        include: [
          {
            model: db.permohonan_progress,
            required: true
          }
        ]
      });
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async getKrkTerbit() {
    try {
      return await db.permohonan.count({
        distinct: true,
        include: [
          {
            model: db.permohonan_progress,
            required: true,
            where: {
              step: 9
            }
          }
        ]
      });
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
}

module.exports = new StatusServices;