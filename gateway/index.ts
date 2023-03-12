import server from './src/server';

async function main() {
  await server.listen({ port: 8080, host: '0.0.0.0' });
}

main();
