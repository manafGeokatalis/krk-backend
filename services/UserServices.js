const { Op } = require("sequelize");
const db = require("../models");

class UserServices {
  async getData(request) {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10;
    const search = request.query.search || '';
    try {
      const offset = (page - 1) * perPage;

      const _where = {
        where: {
          id: {
            [Op.ne]: request.user.id
          },
          [Op.or]: [
            {
              name: {
                [Op.substring]: search
              }
            },
            {
              id_number: {
                [Op.substring]: search
              }
            },
            {
              role: {
                [Op.substring]: search
              }
            },
            {
              wa_number: {
                [Op.substring]: search
              }
            },
            {
              email: {
                [Op.substring]: search
              }
            }
          ]
        }
      };

      if (request.user.role == 'ADMIN') {
        _where.where = {
          ..._where.where, ...{
            [Op.or]: [
              {
                role: 'PUBLIC'
              }
            ]
          }
        };
      }

      const count = await db.user.count({
        ..._where
      });

      const rows = await db.user.findAll({
        ..._where,
        attributes: [
          'id',
          'uuid',
          'name',
          'email',
          'role',
          'id_number',
          'wa_number',
          'address',
          ['created_at', 'createdAt']
        ],
        limit: perPage,
        offset: offset,
        distinct: true,
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

  async getByEmail(email) {
    return await db.user.findOne({ where: { email } });
  }
  async getById(id) {
    return await db.user.findOne({ where: { id } });
  }
  async getByUuid(uuid) {
    return await db.user.findOne({ where: { uuid } });
  }

  async store(data) {
    return await db.user.create(data);
  }

  async checkEmailExist(id, email) {
    return await db.user.count({
      where: {
        id: {
          [Op.ne]: id
        },
        email
      }
    })
  }

  async update(id, data) {
    const user = await db.user.findByPk(id);
    await user.update(data);
    return await db.user.findByPk(id);
  }

  async delete(id) {
    return await db.user.destroy({ where: { id } });
  }
}

module.exports = new UserServices;