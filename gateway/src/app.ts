import path from 'path';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import Cors from '@fastify/cors';
import Multipart from '@fastify/multipart';

export default async function (fastify: FastifyInstance, opts: unknown) {
  // Enables the use of CORS in a Fastify application.
  // https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
  await fastify.register(Cors, {
    origin: false,
  });

  const FILE_SIZE_LIMIT = 1000000000; // 1GB.

  // Enables multipart file uploads.
  // https://www.npmjs.com/package/@fastify/multipart
  await fastify.register(Multipart, {
    limits: {
      fileSize: FILE_SIZE_LIMIT,
    },
  });

  // Health check.
  await fastify.get('/', () => ({ ok: true }));

  // Load all of our routes.
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: false,
    options: Object.assign({}, opts),
  });
}
