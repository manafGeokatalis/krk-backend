'use strict'

const jwt = require('jsonwebtoken');
const { cookieConfigs, jwt_secret } = require('../configs/auth');
const { errorResponse } = require('../utils/helpers');
const UserServices = require('../services/UserServices');

const authError = (reply) => {
  return reply.clearCookie('token', cookieConfigs).status(401).send(errorResponse('Anda tidak memiliki akses', 401));
}

const auth = async (request, reply) => {
  try {
    let token;
    if (request.cookies && request.cookies.token) {
      token = request.cookies.token;
    }

    if (!token && request.headers.authorization) {
      const parts = request.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return authError(reply);
    }

    const decode = jwt.verify(token, jwt_secret);
    console.log(decode);
    if (!decode) {
      return authError(reply);
    }

    const user = await UserServices.getById(decode.id);
    if (!user) {
      return authError(reply);
    }

    reply.cookie('token', token, cookieConfigs);

    request.user = user;
  } catch (error) {
    return authError(reply);
  }
}

module.exports = auth;