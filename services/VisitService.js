const db = require("../models");


class VisitService {
    async createVisit(payload) {
        try {
            return await db.Visit.create(payload);
        } catch (e) {
            console.log(e, 'halo')
        }
    }
}

module.exports = new VisitService;