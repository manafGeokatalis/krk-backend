const fastifyAutoload = require('@fastify/autoload');
const fastifyCookie = require('@fastify/cookie');
const fastifyCors = require('@fastify/cors');
const path = require('path');
require('dotenv').config();


const start = (() => {
  const fastify = require("fastify")({
    logger: process.env.APP_ENV !== 'production'
  });
  fastify.register(fastifyCors, {
    credentials: true,
    origin: process.env.SITE_ORIGIN?.split(',').map(e => e.trim()) || '*'
  });
  fastify.register(fastifyCookie);
  fastify.register(fastifyAutoload, {
    dir: path.join(__dirname, 'controllers'),
    options: {
      prefix: process.env.APP_PREFIX || '/api',
    },
  });

  const staticPath = path.join(__dirname, process.env.APP_STATIC_PATH || 'public');
  fastify.register(require('@fastify/static'), {
    root: staticPath,
    prefix: '/',
  });

  fastify.setNotFoundHandler((request, reply) => {
    const url = request.raw.url
    if (url !== undefined && url.startsWith('/api/')) {
      reply.status(404).send(errorResponse('API route not found', 404));
    } else {
      reply.sendFile('index.html')
    }
  })

  const port = process.env.APP_PORT || 8000;
  fastify.listen({ port }, () => {
    console.log(`Server start on port: ${port}`);
  });
});

start();