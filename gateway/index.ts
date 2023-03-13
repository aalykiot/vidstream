import * as dotenv from 'dotenv';
dotenv.config();

import server from './src/server';
import db from './src/db';

async function main() {
  await db.connect();
  await server.listen({ port: 8080, host: '0.0.0.0' });
}

main();
