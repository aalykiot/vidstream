import { MongoClient, Db } from 'mongodb';
import config from './config';

const { username, password, url, authSource } = config.db;
const uri = `mongodb://${username}:${password}@${url}/?authSource=${authSource}`;

let database: Db;
const client = new MongoClient(uri);

export async function connect() {
  await client.connect();
  database = client.db('vidstream');
}

export function getDatabase(): Db {
  return database;
}

export default {
  connect,
  getDatabase
};
