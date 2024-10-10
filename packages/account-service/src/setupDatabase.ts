import { MongoClient } from 'mongodb';

import { Account } from './models/account';

export async function createIndexes(mongoClient: MongoClient) {
  const accountsCollection = mongoClient.db().collection<Account>('accounts');

  await accountsCollection.createIndex({ username: 1 }, { unique: true });
  await accountsCollection.createIndex({ email: 1 }, { unique: true });
}
