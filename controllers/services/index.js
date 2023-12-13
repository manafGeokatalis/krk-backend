'use strict'
const auth = require("../../middleware/authMiddleware");
const { successResponse } = require("../../utils/helpers");


module.exports = async function (fastify, opts, next) {
  fastify.addHook('preHandler', auth());

  fastify.get('/map-token', async function (_request, reply) {
    reply.send(successResponse(null, { token: process.env.MAPBOX_TOKEN || null }));
  })

}
