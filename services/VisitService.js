const db = require("../models");


class VisitService {
    async createVisit(payload) {
        return await db.Visit.create(payload);
    }
}

module.exports = new VisitService;