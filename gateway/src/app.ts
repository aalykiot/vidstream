import path from 'path';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import Cors from '@fastify/cors';

export default async function (fastify: FastifyInstance, opts: unknown) {
  // Enables the use of CORS in a Fastify application.
  // https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
  await await fastify.register(Cors, {
    origin: false,
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
