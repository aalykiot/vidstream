import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import App from './src/app';
import db from './src/db';
import config from './src/config';
import * as s3 from './src/s3/client';

async function start() {
  const fastify = Fastify();
  const port = Number.parseInt(config.app.port);

  await db.connect();
  await s3.init();
  await fastify.register(App);
  await fastify.listen({ port, host: '0.0.0.0' });
}

start();
