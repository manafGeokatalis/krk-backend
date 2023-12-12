'use strict'

const UserServices = require("../../services/UserServices");
const { errorResponse, successResponse, isEmail } = require("../../utils/helpers");
const jwt = require('jsonwebtoken');
const { jwt_secret, cookieConfigs } = require("../../configs/auth");
const auth = require("../../middleware/authMiddleware");
const { compare } = require("bcrypt");

const errorLogin = (reply) => {
  reply.status(401).send(errorResponse('Data login tidak benar', 401));
}

module.exports = async function (fastify) {
  fastify.post('/login', async function (request, reply) {
    const { email, password } = request.body;
    const user = await UserServices.getByEmail(email);
    if (!user) {
      return errorLogin(reply);
    }

    const checkPassword = await compare(password, user.password);
    if (!checkPassword) {
      return errorLogin(reply);
    }

    const token = jwt.sign({ id: user.id }, jwt_secret);

    const userJson = user.toJSON();
    delete userJson.password;

    reply.cookie('token', token, cookieConfigs)
      .send(successResponse('Login Success', userJson));
  })

  fastify.post('/register', async function (request, reply) {
    const data = request.body;

    const user = await UserServices.getByEmail(data.email);
    if (user) {
      reply.status(406).send(errorResponse({
        email: 'Email sudah digunakan'
      }, 406));
    }

    if (!data.name) {
      reply.status(406).send(errorResponse({
        name: 'Nama tidak boleh kosong'
      }, 406));
    }
    if (!data.email) {
      reply.status(406).send(errorResponse({
        email: 'Email tidak boleh kosong'
      }, 406));
    }
    if (!isEmail(data.email)) {
      reply.status(406).send(errorResponse({
        email: 'Format email tidak benar'
      }, 406));
    }
    if (data.password !== data.confirm_password) {
      reply.status(406).send(errorResponse({
        confirm_password: 'Perulangan password tidak benar'
      }, 406));
    }

    delete data.confirm_password;
    const save = await UserServices.store(data);
    const token = jwt.sign({ id: save.id }, jwt_secret);

    const userJson = save.toJSON();
    delete userJson.password;


    reply.cookie('token', token, cookieConfigs).send(successResponse('Data berhasil disimpan', save));
  })

  fastify.get('/status', { preHandler: auth }, async function (request, reply) {
    const userJson = request.user.toJSON();
    delete userJson.password;
    reply.send(successResponse('OK', request.user));
  })

  fastify.post('/logout', { preHandler: auth }, async function (_request, reply) {
    reply.clearCookie('token', cookieConfigs).send(successResponse('Logout berhasil'));
  })

  fastify.post('/profile', { preHandler: auth }, async function (request, reply) {
    const data = request.body;
    const user = request.user;
    const checkEmail = await UserServices.checkEmailExist(user.id, data.email);
    if (checkEmail) {
      return reply.status(406).send(errorResponse(`Email ${data.email} sudah digunakan`, 406));
    }
    if (data.password !== data.confirm_password) {
      return reply.status(406).send(errorResponse('Perulangan password tidak benar', 406));
    }

    delete data.confirm_password;
    if (data.password == '') {
      delete data.password;
    }
    const update = await UserServices.update(user.id, data);
    const userJson = update.toJSON();
    delete userJson.password;
    reply.send(successResponse('Data berhasil disimpan', userJson));
  })


}
