import { MongoClient } from 'mongodb';

import { Message } from './models/message';

export async function createIndexes(mongoClient: MongoClient) {
  const messagesCollection = mongoClient.db().collection<Message>('messages');

  await messagesCollection.createIndex({ accountId: 1 });
  await messagesCollection.createIndex({ accountUsername: 1 });
  await messagesCollection.createIndex({ dateCreated: 1 });
}
