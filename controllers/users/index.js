'use strict'

const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const UserServices = require("../../services/UserServices");
const { successResponse, errorResponse } = require("../../utils/helpers");

module.exports = async function (fastify, opts, next) {
  fastify.addHook('preHandler', auth());

  fastify.get('/', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    try {
      const query = await UserServices.getData(request);
      reply.send(successResponse(null, query));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }

  });

  fastify.get('/:uuid', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    try {
      const query = await UserServices.getByUuid(request.params.uuid);
      const json = query.toJSON();
      delete json.password;
      reply.send(successResponse(null, json));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }

  });

  fastify.post('/', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    const data = request.body;
    const checkEmail = await UserServices.checkEmailExist(null, data.email);
    if (checkEmail) {
      return reply.status(406).send(errorResponse(`Email ${data.email} sudah digunakan`, 406));
    }

    if (data.password == '') {
      return reply.status(406).send(errorResponse('Password tidak boleh kosong', 406));
    }
    if (data.password !== data.confirm_password) {
      return reply.status(406).send(errorResponse('Perulangan password tidak benar', 406));
    }

    delete data.confirm_password;
    const update = await UserServices.store(data);
    const userJson = update.toJSON();
    delete userJson.password;
    reply.send(successResponse('Data berhasil disimpan', userJson));
  })

  fastify.put('/:uuid', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    const data = request.body;
    if (data.password !== data.confirm_password) {
      return reply.status(406).send(errorResponse('Perulangan password tidak benar', 406));
    }

    const query = await UserServices.getByUuid(request.params.uuid);
    if (!query) {
      return reply.status(404).send(errorResponse('Data tidak ditemukan', 404));
    }

    const checkEmail = await UserServices.checkEmailExist(query.id, data.email);
    if (checkEmail) {
      return reply.status(406).send(errorResponse(`Email ${data.email} sudah digunakan`, 406));
    }


    delete data.confirm_password;
    if (data.password == '') {
      delete data.password;
    }
    const update = await UserServices.update(query.id, data);
    const userJson = update.toJSON();
    delete userJson.password;
    reply.send(successResponse('Data berhasil disimpan', userJson));
  })

  fastify.delete('/:uuid', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    const uuid = request.params.uuid;
    const query = await UserServices.getByUuid(uuid);
    if (!query) {
      return reply.status(404).send(errorResponse('Data tidak ditemukan', 404));
    }
    await UserServices.delete(query.id);
    reply.send(successResponse('Data berhasil dihapus'));
  })


}
