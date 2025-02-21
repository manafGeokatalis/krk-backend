const { col, Op } = require("sequelize");
const db = require("../models");
const { generateRandomChar } = require("../utils/helpers");
const { unlink } = require("fs/promises");
const { existsSync } = require("fs");

class PermohonanServices {
  async getData(request) {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10;
    const search = request.query.search || '';

    try {
      const offset = (page - 1) * perPage;

      const _where = request.user.role === 'PUBLIC' ? {
        where: {
          [Op.and]: [
            { user_id: request.user.id },
            {
              [Op.or]: [
                {
                  registration_number: {
                    [Op.substring]: search
                  }
                },
                {
                  fungsi_bangunan: {
                    [Op.substring]: search
                  }
                },
                {
                  lokasi_alamat: {
                    [Op.substring]: search
                  }
                }
              ]
            }
          ]
        }
      } : {
        where: {
          [Op.or]: [
            {
              name: {
                [Op.substring]: search
              }
            },
            {
              registration_number: {
                [Op.substring]: search
              }
            },
            {
              fungsi_bangunan: {
                [Op.substring]: search
              }
            },
            {
              lokasi_alamat: {
                [Op.substring]: search
              }
            }
          ]
        }
      };

      const count = await db.permohonan.count({
        ..._where,
        include: [
          db.provinsi,
          db.kabupaten,
          db.kecamatan,
          db.kelurahan,
          {
            model: db.provinsi,
            as: 'lokasi_provinsi'
          },
          {
            model: db.kabupaten,
            as: 'lokasi_kabupaten'
          },
          {
            model: db.kecamatan,
            as: 'lokasi_kecamatan'
          },
          {
            model: db.kelurahan,
            as: 'lokasi_kelurahan'
          }
        ],
      });

      const rows = await db.permohonan.findAll({
        ..._where,
        include: [
          db.provinsi,
          db.kabupaten,
          db.kecamatan,
          db.kelurahan,
          {
            model: db.provinsi,
            as: 'lokasi_provinsi'
          },
          {
            model: db.kabupaten,
            as: 'lokasi_kabupaten'
          },
          {
            model: db.kecamatan,
            as: 'lokasi_kecamatan'
          },
          {
            model: db.kelurahan,
            as: 'lokasi_kelurahan'
          },
          {
            model: db.user,
            as: 'staff'
          },
          {
            model: db.permohonan_progress,
            order: [
              ['step', 'asc']
            ],
            limit: 10,
            offset: 0,
          }
        ],

        distinct: true,
        group: ['permohonan.id'],
        order: [
          ['created_at', 'desc'],
        ]
      });

      const totalPages = Math.ceil(count / perPage);

      return {
        data: rows,
        pagination: {
          total: count,
          perPage,
          currentPage: page,
          totalPages,
        },
      };
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }


  async store(user_id, data) {
    const registration_number = await generateRandomChar(11);
    return await db.permohonan.create({
      ...data,
      user_id,
      registration_number
    });
  }

  async update(id, data) {
    const update = await db.permohonan.findByPk(id);
    if (!update) {
      throw new Error('Data tidak ditemukan');
    }

    return await update.update(data);
  }

  async getByUuid(uuid) {
    return await db.permohonan.findOne({
      where: { uuid },
      include: [
        db.provinsi,
        db.kabupaten,
        db.kecamatan,
        db.kelurahan,
        db.permohonan_progress,
        {
          model: db.provinsi,
          as: 'lokasi_provinsi'
        },
        {
          model: db.kabupaten,
          as: 'lokasi_kabupaten'
        },
        {
          model: db.kecamatan,
          as: 'lokasi_kecamatan'
        },
        {
          model: db.kelurahan,
          as: 'lokasi_kelurahan'
        },
        {
          model: db.user,
          as: 'staff'
        }
      ]
    });
  }
  async getById(id) {
    return await db.permohonan.findByPk(id, {
      include: [
        db.permohonan_progress,
        {
          model: db.user,
          as: 'staff'
        }
      ]
    });
  }
  async getByRegistrationNumber(registration_number) {
    return await db.permohonan.findOne({
      where: { registration_number },
      include: [
        db.permohonan_progress,
        {
          model: db.user,
          as: 'staff'
        }
      ]
    });
  }

  async updateStatus(staff_id, id, status) {
    const query = await db.permohonan.findByPk(id);
    if (!query) {
      throw new Error('Data tidak ditemukan');
    }
    if (!query.staff_id) {
      await query.update({ staff_id });
    }

    const steps = status.map((_obj, key) => key);
    await db.permohonan_progress.destroy({
      where:
      {
        permohonan_id: query.id,
        step: {
          [Op.notIn]: steps
        }
      }
    });
    const queryStep = await db.permohonan_progress.findAll({
      where: {
        permohonan_id: query.id
      }
    });

    const dataStep = queryStep.map((obj) => obj.step);
    for await (const key of Object.keys(status)) {
      if (!dataStep.includes(parseInt(key))) {
        const el = status[key];
        await db.permohonan_progress.create({
          permohonan_id: query.id,
          step: key,
          processed_on: new Date(),
          desc: el.title
        });
      }
    }
    return await this.getById(query.id);
  }

  async updateStatusByStep(staff_id, id, step, status) {
    const query = await db.permohonan.findByPk(id);
    if (!query) {
      throw new Error('Data tidak ditemukan');
    }
    if (!query.staff_id) {
      await query.update({ staff_id });
    }

    const queryStep = await db.permohonan_progress.findOne({
      where: {
        permohonan_id: query.id,
        step
      }
    });

    if (queryStep) {
      return await queryStep.update(status);
    }
    return await db.permohonan_progress.create({
      permohonan_id: query.id,
      step,
      processed_on: new Date(),
      desc: status.title,
      file: status.file,
    });
  }

  async destroy(id) {
    const query = await db.permohonan.findByPk(id, {
      include: [
        db.permohonan_progress
      ]
    });
    if (!query) {
      throw new Error('Data tidak ditemukan');
    }
    this.deleteFile(query.ktp);
    this.deleteFile(query.pbb);
    this.deleteFile(query.surat_kuasa_mengurus);
    this.deleteFile(query.sertifikat_tanah);
    this.deleteFile(query.skpt);
    this.deleteFile(query.suket_tidak_sengketa);
    this.deleteFile(query.surat_perjanjian);
    this.deleteFile(query.rekom_ketinggian_bangunan);
    this.deleteFile(query.persetujuan_walikota);

    for await (const progress of query.permohonan_progresses) {
      this.deleteFile(progress.file);
      await progress.destroy();
    }

    return await query.destroy();
  }

  async deleteFile(filename) {
    if (existsSync(`./public/uploads/${filename}`)) {
      unlink(`./public/uploads/${filename}`);
    }
  }
}

module.exports = new PermohonanServices;