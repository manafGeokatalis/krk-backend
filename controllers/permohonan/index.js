'use strict'
const fs = require('fs');
const fastifyMultipart = require("@fastify/multipart")
const auth = require("../../middleware/authMiddleware")
const { errorResponse, successResponse } = require("../../utils/helpers");
const pump = require('pump');
const md5 = require('md5');
const PermohonanServices = require('../../services/PermohonanServices');
const { error } = require('console');
const role = require('../../middleware/roleMiddleware');

module.exports = async function (fastify) {
  fastify.addHook('preHandler', auth)

  fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  });

  fastify.get('/', async function (request, reply) {
    try {
      const query = await PermohonanServices.getData(request);
      reply.send(successResponse(null, query));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }

  });

  fastify.get('/:uuid', async function (request, reply) {
    try {
      const query = await PermohonanServices.getByUuid(request.params.uuid);
      if (request.user.role == 'PUBLIC' && request.user.id != query.user_id) {
        reply.status(404).send(error('Data tidak ditemukan', 404));
      }
      reply.send(successResponse(null, query));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }
  });

  fastify.post('/', async function (request, reply) {
    try {
      const parts = request.parts();
      const fields = {};
      for await (const part of parts) {
        if (part.type === 'file') {
          if (part?.mimetype !== 'application/pdf') {
            return reply.code(400).send(errorResponse('Format file harus PDF', 400));
          }
          part.file.on('limit', () => {
            return reply.code(400).send(errorResponse('Ukuran file maksimal 10MB', 400));
          });
          const filename = part.filename ? `${md5((new Date()) + part.filename)}.pdf` : null;
          pump(part.file, fs.createWriteStream(`./uploads/${filename}`));
          fields[part.fieldname] = filename;
        } else {
          fields[part.fieldname] = part.value && part.value != 'null' ? part.value : null;
        }
      }

      const insert = await PermohonanServices.store(request.user.id, fields);

      reply.send(successResponse('Data berhasil disimpan', insert));
    } catch (error) {
      reply.code(500).send(errorResponse(error.message));
    }
  })

  fastify.put('/:uuid', async function (request, reply) {
    try {
      const parts = request.parts();
      const fields = {};
      const query = await PermohonanServices.getByUuid(request.params.uuid);
      if (!query) {
        return reply.status(404).send(errorResponse('Data tidak ditemukan'));
      }
      if (request.user.role == 'PUBLIC' && request.user.id != query.user_id) {
        reply.status(404).send(error('Data tidak ditemukan', 404));
      }
      if (query.permohonan_progresses.length > 0) {
        return reply.status(400).send(errorResponse('Permohonan sudah dipropses'));
      }
      for await (const part of parts) {
        if (part.type === 'file') {
          if (part?.mimetype !== 'application/pdf') {
            return reply.code(400).send(errorResponse('Format file harus PDF', 400));
          }
          part.file.on('limit', () => {
            return reply.code(400).send(errorResponse('Ukuran file maksimal 10MB', 400));
          });
          const filename = part.filename ? `${md5((new Date()) + part.filename)}.pdf` : null;
          pump(part.file, fs.createWriteStream(`./uploads/${filename}`));
          fields[part.fieldname] = filename;
          PermohonanServices.deleteFile(query[part.fieldname]);
        } else {
          fields[part.fieldname] = part.value && part.value != 'null' ? part.value : (query[part.fieldname] ?? null);
        }
      }

      const insert = await PermohonanServices.update(query.id, fields);

      reply.send(successResponse('Data berhasil disimpan', insert));
    } catch (error) {
      console.log(error);
      reply.code(500).send(errorResponse(error.message));
    }
  })

  fastify.put('/:uuid/update-status', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    try {
      const parts = request.parts();
      const fields = {};
      const query = await PermohonanServices.getByUuid(request.params.uuid);
      if (!query) {
        return reply.status(404).send(errorResponse('Data tidak ditemukan'));
      }

      let filename = null;
      for await (const part of parts) {
        if (part.type === 'file') {
          if (part?.mimetype !== 'application/pdf') {
            return reply.code(400).send(errorResponse('Format file harus PDF', 400));
          }
          part.file.on('limit', () => {
            return reply.code(400).send(errorResponse('Ukuran file maksimal 10MB', 400));
          });
          filename = part.filename ? `${md5((new Date()) + part.filename)}.pdf` : null;
          pump(part.file, fs.createWriteStream(`./uploads/${filename}`));
          const progressFile = query.permohonan_progresses.filter((obj) => obj.step == 9);
          if (progressFile.length > 0) {
            PermohonanServices.deleteFile(progressFile[0].file);
          }
        }
      }

      const insert = await PermohonanServices.updateStatusByStep(request.user.id, query.id, 9, { title: '9. Dokumen KRK telah terbit', file: filename });

      reply.send(successResponse('Data berhasil disimpan', insert));
    } catch (error) {
      console.log(error);
      reply.code(500).send(errorResponse(error.message));
    }
  })

  fastify.post('/:uuid/update-status', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    try {
      const query = await PermohonanServices.getByUuid(request.params.uuid);
      if (!query) {
        return reply.status(404).send(errorResponse('Data tidak ditemukan'));
      }

      if (request.body.length < 10) {
        const progressFile = query.permohonan_progresses.filter((obj) => obj.step == 9);
        if (progressFile.length > 0) {
          PermohonanServices.deleteFile(progressFile[0].file);
        }
      }

      const insert = await PermohonanServices.updateStatus(request.user.id, query.id, request.body);

      reply.send(successResponse('Status berhasil diupdate', insert));
    } catch (error) {
      console.log(error);
      reply.code(500).send(errorResponse(error.message));
    }
  })

  fastify.put('/:uuid/reject', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    try {
      const query = await PermohonanServices.getByUuid(request.params.uuid);
      if (!query) {
        return reply.status(404).send(errorResponse('Data tidak ditemukan'));
      }

      const insert = await PermohonanServices.updateStatusByStep(request.user.id, query.id, 11, { title: request.body.message });

      reply.send(successResponse('Data berhasil disimpan', insert));
    } catch (error) {
      console.log(error);
      reply.code(500).send(errorResponse(error.message));
    }
  })

  fastify.delete('/:uuid/destroy', async function (request, reply) {
    try {
      const query = await PermohonanServices.getByUuid(request.params.uuid);
      if (!query) {
        return reply.status(404).send(errorResponse('Data tidak ditemukan'));
      }
      if (request.user.role == 'PUBLIC' && request.user.id != query.user_id) {
        reply.status(404).send(error('Data tidak ditemukan', 404));
      }
      if (query.permohonan_progresses.length > 0) {
        return reply.status(400).send(errorResponse('Permohonan sudah dipropses'));
      }
      await PermohonanServices.destroy(query.id);
      reply.send(successResponse('Permohonan berhasil ditarik'));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }
  });

  fastify.delete('/:uuid', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    try {
      const query = await PermohonanServices.getByUuid(request.params.uuid);
      if (!query) {
        return reply.status(404).send(errorResponse('Data tidak ditemukan'));
      }
      await PermohonanServices.destroy(query.id);
      reply.send(successResponse('Permohonan berhasil dihapus'));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }
  });

}
