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
    dir: path.join(__dirname, 'routes'),
    options: {
      prefix: process.env.APP_PREFIX || '/api',
    },
  });

  const port = process.env.APP_PORT || 8000;
  fastify.listen({ port }, () => {
    console.log(`Server start on port: ${port}`);
  });
});

start();