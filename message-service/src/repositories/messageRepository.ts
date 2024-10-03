import { GetMessagesRequest, Page } from 'chatapp.message-service-contracts';
import { Sort } from 'mongodb';

import { databaseClient } from '../databaseClient';
import Message from '../models/message';

const messageCollection = databaseClient.db().collection<Message>('messages');

export async function createMessage(message: Message): Promise<Message> {
  await messageCollection.insertOne(message);
  return message;
}

export async function getMessages({
  page,
  pageSize,
  sortBy,
  sortDirection,
}: GetMessagesRequest): Promise<Page<Message>> {
  const totalRecords = await messageCollection.countDocuments();

  const skip = page * pageSize;
  const limit = pageSize;
  const sort: Sort = {
    [sortBy]: sortDirection === 'asc' ? 1 : -1,
  };

  const records = await messageCollection
    .find({}, { skip, limit, sort })
    .toArray();

  return {
    records,
    totalRecords,
    page,
    pageSize,
    totalPages: Math.ceil(totalRecords / pageSize),
  };
}
