'use strict'

const path = require("path");
const os = require('os');
const mime = require('mime-types');
const { readFile, copyFile, mkdir, unlink, rm } = require("fs/promises");
const PermohonanServices = require("../../services/PermohonanServices");
const { errorResponse } = require("../../utils/helpers");
const md5 = require("md5");
const archiver = require("archiver");
const { createWriteStream } = require("fs");

module.exports = async function (fastify) {
  fastify.get('/:filename', async function (request, reply) {
    const fileName = request.params.filename;
    const filePath = path.resolve(`./uploads/${fileName}`);

    reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(filePath)}`);

    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    reply.type(contentType);

    const file = await readFile(filePath);
    reply.send(file);
  })

  fastify.get('/permohonan/:uuid/berkas', async function (request, reply) {
    const query = await PermohonanServices.getByUuid(request.params.uuid);
    if (!query) {
      reply.status(404).send(errorResponse('Data tidak ditemukan'));
    }

    const tempDir = path.join(os.tmpdir(), md5(`${new Date()}-${request.params.uuid}`));
    await mkdir(tempDir);
    const ktp = query.ktp ? path.join('./uploads', query.ktp) : null;
    const pbb = query.pbb ? path.join('./uploads', query.pbb) : null;
    const surat_kuasa_mengurus = query.surat_kuasa_mengurus ? path.join('./uploads', query.surat_kuasa_mengurus) : null;
    const sertifikat_tanah = query.sertifikat_tanah ? path.join('./uploads', query.sertifikat_tanah) : null;
    const skpt = query.skpt ? path.join('./uploads', query.skpt) : null;
    const suket_tidak_sengketa = query.suket_tidak_sengketa ? path.join('./uploads', query.suket_tidak_sengketa) : null;
    const surat_perjanjian = query.surat_perjanjian ? path.join('./uploads', query.surat_perjanjian) : null;
    const rekom_ketinggian_bangunan = query.rekom_ketinggian_bangunan ? path.join('./uploads', query.rekom_ketinggian_bangunan) : null;
    const persetujuan_walikota = query.persetujuan_walikota ? path.join('./uploads', query.persetujuan_walikota) : null;

    if (ktp) {
      await copyFile(ktp, path.join(tempDir, 'ktp.pdf'));
    }
    if (pbb) {
      await copyFile(pbb, path.join(tempDir, 'pbb.pdf'));
    }
    if (surat_kuasa_mengurus) {
      await copyFile(surat_kuasa_mengurus, path.join(tempDir, 'surat_kuasa_mengurus.pdf'));
    }
    if (sertifikat_tanah) {
      await copyFile(sertifikat_tanah, path.join(tempDir, 'sertifikat_tanah.pdf'));
    }
    if (skpt) {
      await copyFile(skpt, path.join(tempDir, 'skpt.pdf'));
    }
    if (suket_tidak_sengketa) {
      await copyFile(suket_tidak_sengketa, path.join(tempDir, 'suket_tidak_sengketa.pdf'));
    }
    if (surat_perjanjian) {
      await copyFile(surat_perjanjian, path.join(tempDir, 'surat_perjanjian.pdf'));
    }
    if (rekom_ketinggian_bangunan) {
      await copyFile(rekom_ketinggian_bangunan, path.join(tempDir, 'rekom_ketinggian_bangunan.pdf'));
    }
    if (persetujuan_walikota) {
      await copyFile(persetujuan_walikota, path.join(tempDir, 'persetujuan_walikota.pdf'));
    }

    const zipName = md5(`${new Date()}-${query.uuid}`) + '.zip';
    const zipFilePath = path.join(os.tmpdir(), zipName);
    const output = createWriteStream(zipFilePath);

    const archive = archiver('zip', { zlib: { level: 9 } });


    output.on('close', async () => {
      const contentType = mime.lookup(zipFilePath) || 'application/octet-stream';
      reply.type(contentType);
      const file = await readFile(zipFilePath);
      await rm(tempDir, { recursive: true });
      await unlink(zipFilePath);
      reply.send(file);
    });

    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();
    return reply;
  })


}
