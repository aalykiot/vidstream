import fastify from 'fastify';

const server = fastify();

server.get('/', (_request, reply) => {
  reply.send({ ok: true });
});

export default server;
