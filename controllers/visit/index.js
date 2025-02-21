'use strict'

const VisitService = require("../../services/VisitService");
const { successResponse, errorResponse } = require("../../utils/helpers");
module.exports = async function (fastify) {
    fastify.post('/', async function (request, reply) {
        const { page, timestamp } = request.body;
        const ipAddress = request.ip;
        const userAgent = request.headers['user-agent'];
        const payload = {
            page: page,
            timestamp: timestamp,
            ip_address: ipAddress,
            user_agent: userAgent
        }
        const storeVisit = await VisitService.createVisit(payload)

        reply.send(successResponse(null, { 'message': 'success' }));
    })

}