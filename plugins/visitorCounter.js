// 'use strict'
const { caching } = require("cache-manager");
const fp = require('fastify-plugin');
const { existsSync } = require("fs");
const { readFile, writeFile } = require("fs/promises");
const md5 = require("md5");
const path = require("path");

module.exports = fp(async function (fastify) {
  const visitorCache = await caching('memory', {
    max: 1000,
    ttl: process.env.VISITOR_TTL ? process.env.VISITOR_TTL * 1000 : 60 * 60 * 1000
  });

  fastify.decorateRequest('visitorCount', 0);

  fastify.addHook('onRequest', async (request) => {
    const key = md5(`visitor_${request.ip}_${request.headers['user-agent']}`);
    const visitor = await visitorCache.get(key);
    const date = new Date();
    const counterDir = 'visitor-counter';
    const fileCounter = `${date.getFullYear()}_${date.getMonth() + 1}.log`;
    let counter = 0;

    if (existsSync(path.join(counterDir, fileCounter))) {
      counter = Number(await readFile(path.join(counterDir, fileCounter)));
    }

    if (!visitor) {
      counter++;
      await visitorCache.set(key, Date.now());
      await writeFile(path.join(counterDir, fileCounter), String(counter));
    }
    request.visitorCount = counter;
  });
})
