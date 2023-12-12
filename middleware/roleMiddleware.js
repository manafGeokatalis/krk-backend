const { errorResponse } = require("../utils/helpers");

const role = (role = []) => {
  return async (request, reply) => {
    if (!role.includes(request.user.role.toLowerCase())) {
      return reply.status(401).send(errorResponse('Anda tidak memiliki akses', 401));
    }
  }
}

module.exports = role;