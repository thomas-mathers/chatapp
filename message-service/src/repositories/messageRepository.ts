import { databaseClient } from '../databaseClient';
import Message from '../models/message';

const messageCollection = databaseClient.db().collection<Message>('messages');

export async function createMessage(message: Message): Promise<Message> {
  await messageCollection.insertOne(message);
  return message;
}

export async function getMessages(): Promise<Message[]> {
  return await messageCollection.find({}).sort({ dateCreated: 1 }).toArray();
}
