'use strict'
const auth = require("../../middleware/authMiddleware");
const StatusServices = require("../../services/StatusServices");
const { successResponse, errorResponse } = require("../../utils/helpers");


module.exports = async function (fastify, opts, next) {
  fastify.addHook('preHandler', auth());

  fastify.get('/map-token', async function (_request, reply) {
    reply.send(successResponse(null, { token: process.env.MAPBOX_TOKEN || null }));
  })

  fastify.get('/data-status', async function (request, reply) {
    try {
      const visitor_count = request.visitorCount;
      const permohonan_diprose = await StatusServices.getPermohonanDiproses();
      const krk_terbit = await StatusServices.getKrkTerbit();

      reply.send(successResponse(null, { visitor_count, permohonan_diprose, krk_terbit, loading: false }));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }
  })

}
