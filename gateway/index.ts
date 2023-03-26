import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import App from './src/app';
import config from './src/config';
import * as s3 from './src/s3/client';
import * as queue from './src/async-queue/client';

async function start() {
  // Initialize fastify app.
  const fastify = Fastify();
  const port = Number.parseInt(config.app.port);

  // Connect to external services.
  await s3.init();
  await queue.connect();

  // Start server.
  await fastify.register(App);
  await fastify.listen({ port, host: '0.0.0.0' });
}

start();
