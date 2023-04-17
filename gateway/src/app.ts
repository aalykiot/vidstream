import path from 'path';
import { EventEmitter } from 'events';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import Cors from '@fastify/cors';
import Multipart from '@fastify/multipart';
import WebSockets from '@fastify/websocket';

// Create a new event emitter instance to facilitate communication
// between different parts of the application.
export const eventBus = new EventEmitter();

export default async function (fastify: FastifyInstance, opts: unknown) {
  // Enables the use of CORS in a Fastify application.
  // https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
  await fastify.register(Cors, {
    origin: '*',
  });

  const FILE_SIZE_LIMIT = 1000000000; // 1GB.

  // Enables multipart file uploads.
  // https://www.npmjs.com/package/@fastify/multipart
  await fastify.register(Multipart, {
    limits: {
      fileSize: FILE_SIZE_LIMIT,
    },
  });

  // Enables web-sockets support.
  // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
  await fastify.register(WebSockets);

  // Health check.
  await fastify.get('/', () => ({ ok: true }));

  // Load all of our routes.
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: false,
    options: Object.assign({}, opts),
  });
}
