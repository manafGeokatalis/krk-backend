'use strict'
const auth = require("../../middleware/authMiddleware");
const LocationServices = require("../../services/LocationServices");
const { successResponse, errorResponse } = require("../../utils/helpers");


module.exports = async function (fastify) {
  fastify.addHook('preHandler', auth());
  fastify.get('/provinsi', async function (_request, reply) {
    try {
      const data = await LocationServices.getProvinsi();
      reply.send(successResponse(null, data));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }
  })
  fastify.get('/kabupaten/:provinsi_id', async function (request, reply) {
    try {
      const data = await LocationServices.getKabupaten(request.params.provinsi_id);
      reply.send(successResponse(null, data));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }
  })
  fastify.get('/kecamatan/:kabupaten_id', async function (request, reply) {
    try {
      const data = await LocationServices.getKecamatan(request.params.kabupaten_id);
      reply.send(successResponse(null, data));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }
  })
  fastify.get('/kelurahan/:kecamatan_id', async function (request, reply) {
    try {
      const data = await LocationServices.getKelurahan(request.params.kecamatan_id);
      reply.send(successResponse(null, data));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }
  })

}
