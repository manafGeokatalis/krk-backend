'use strict'
module.exports = async function (fastify, opts, next) {
  fastify.get('/', async function (request, reply) {
    reply.send('User Cars');
  })

}
