'use strict'
const fs = require('fs');
const fastifyMultipart = require("@fastify/multipart")
const auth = require("../../middleware/authMiddleware")
const { errorResponse, successResponse, sortingPermohonan, removeCircularReferences } = require("../../utils/helpers");
const pump = require('pump');
const md5 = require('md5');
const PermohonanServices = require('../../services/PermohonanServices');
const EmailServices = require('../../services/EmailServices');

const { error } = require('console');
const role = require('../../middleware/roleMiddleware');

module.exports = async function (fastify) {
  fastify.addHook('preHandler', auth())

  fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  });

  fastify.get('/', async function (request, reply) {
    try {
      const response = await PermohonanServices.getData(request);

      const order = request.query.order || 'desc';
      const orderBy = request.query.orderBy || 'name';

      const convertData = response.data.map((item) => {
        const safeItem = removeCircularReferences(item);

        const lastProgress = item.permohonan_progresses && item.permohonan_progresses.length > 0
          ? item.permohonan_progresses[item.permohonan_progresses.length - 1]
          : null;

        // Set last_step to 0 if no progress is found
        const lastStep = lastProgress ? lastProgress.step : 0;
        return {
          ...safeItem,
          last_step: lastStep
        }
      })

      const data = sortingPermohonan(order, orderBy, convertData)

      // const mappingData = data.map((item) => item.permohonan_progresses[item.permohonan_progresses.length - 1]?.step)

      reply.send(successResponse(null, {
        data: data,
        pagination: response.pagination
      }));
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
          pump(part.file, fs.createWriteStream(`./public/uploads/${filename}`));
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
          pump(part.file, fs.createWriteStream(`./public/uploads/${filename}`));
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
          pump(part.file, fs.createWriteStream(`./public/uploads/${filename}`));
          const progressFile = query.permohonan_progresses.filter((obj) => obj.step == 9);
          if (progressFile.length > 0) {
            PermohonanServices.deleteFile(progressFile[0].file);
          }
        }
      }

      const insert = await PermohonanServices.updateStatusByStep(request.user.id, query.id, 5, { title: 'Dokumen KRK telah terbit', file: filename });

      // const insert = await PermohonanServices.updateStatusByStep(request.user.id, query.id, 9, { title: '9. Dokumen KRK telah terbit', file: filename });

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


      const newData = await PermohonanServices.getByUuid(request.params.uuid);
      const checkLastProgress = newData.permohonan_progresses[newData.permohonan_progresses.length - 1]

      //SEND EMAIL KRK TERBIT
      if (checkLastProgress.step == 5) {
        const subject = 'KRK Terbit - KRK Manggarai Barat'
        const text = 'Permohonan KRK yang anda ajukan telah SELESAI, silahkan mengecek status permohonan pada web KRK untuk mendownload dokumen KRK anda'

        const user = {
          email: query.email,
          name: query.name
        }
        await EmailServices.sendEmailUpdateStatus(user, subject, text, query.registration_number)

      }

      reply.send(successResponse('Status berhasil diupdate', insert));
    } catch (error) {
      console.log(error);
      reply.code(500).send(errorResponse(error.message));
    }
  })

  fastify.post('/update-status-bulk', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    try {

      const ids = request.body.id
      const status = request.body.status

      for (const id of ids) {


        // Await the status update for each ID
        await PermohonanServices.updateStatus(request.user.id, id, status);
      }

      reply.send(successResponse('Permohonan Berhasil di update'));

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


      const subject = 'Pemberitahuan - KRK Manggarai Barat'
      const text = 'Permohonan KRK yang anda ajukan telah terhenti/ditolak oleh admin.'

      const user = {
        email: query.email,
        name: query.name
      }
      //SEND UPDATE EMAIL
      await EmailServices.sendEmailUpdateStatus(user, subject, text, query.registration_number)

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

  fastify.post('/delete-permohonan-bulk', { preHandler: role(['superadmin', 'admin']) }, async function (request, reply) {
    const ids = request.body.id
    for (const id of ids) {
      await PermohonanServices.destroy(id);
    }

    reply.send(successResponse('Permohonan Berhasil di delete'));
  })

  fastify.get('/send-cek-lapangan/:uuid', async function (request, reply) {
    try {
      const query = await PermohonanServices.getByUuid(request.params.uuid);
      if (request.user.role == 'PUBLIC' && request.user.id != query.user_id) {
        reply.status(404).send(error('Data tidak ditemukan', 404));
      }

      const subject = 'Tahap Lapangan - KRK Manggarai Barat'
      const text = 'Permohonan KRK yang anda ajukan telah masuk ke tahap CEK LAPANGAN, silahkan menghubungi pihak admin KRK Kabupaten Manggarai Barat '

      const user = {
        email: query.email,
        name: query.name
      }

      await EmailServices.sendEmailUpdateStatus(user, subject, text, query.registration_number)


      reply.send(successResponse(null, query));
    } catch (error) {
      reply.status(500).send(errorResponse(error.message));
    }
  })

}
