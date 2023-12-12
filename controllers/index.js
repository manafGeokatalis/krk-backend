'use strict'

const PermohonanServices = require("../services/PermohonanServices");
const { errorResponse, successResponse } = require("../utils/helpers");

module.exports = async function (fastify, opts, next) {
  fastify.post('/check-permohonan', async function (request, reply) {
    const { registration_number } = request.body;
    const query = await PermohonanServices.getByRegistrationNumber(registration_number);
    if (!query) {
      reply.status(404).send(errorResponse(`Permohonan dengan nomor registrasi "${registration_number}" tidak ditemukan`));
    }

    reply.send(successResponse('Data ditemukan', query));
  });

  fastify.get('/data-permohonan/:uuid', async function (request, reply) {
    try {
      const query = await PermohonanServices.getByUuid(request.params.uuid);
      reply.send(successResponse(null, query));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }
  });
}
