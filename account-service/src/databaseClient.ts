import { MongoClient } from 'mongodb';

import env from './config';
import Account from './models/account';

const databaseClient = new MongoClient(env.mongoUri);

export async function connect() {
  await databaseClient.connect();
  await createIndexes();
}

export async function close() {
  await databaseClient.close();
}

export function getAccountsCollection() {
  return databaseClient.db().collection<Account>('accounts');
}

async function createIndexes() {
  await getAccountsCollection().createIndex({ username: 1 }, { unique: true });
  await getAccountsCollection().createIndex({ email: 1 }, { unique: true });
}
