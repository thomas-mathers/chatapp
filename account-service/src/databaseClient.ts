import { MongoClient } from 'mongodb';

import env from './env';
import Account from './models/account';

const databaseClient = new MongoClient(env.ACCOUNT_SERVICE_MONGO_URI);

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
}
