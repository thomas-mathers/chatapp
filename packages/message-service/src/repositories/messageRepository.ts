import {
  GetMessagesRequest,
  Page,
  SortDirection,
} from 'chatapp.message-service-contracts';
import { Collection, Sort } from 'mongodb';

import { Message } from '../models/message';

export class MessageRepository {
  constructor(private readonly messages: Collection<Message>) {}

  async createMessage(message: Message): Promise<Message> {
    await this.messages.insertOne(message);
    return message;
  }

  async getMessages({
    page = 0,
    pageSize = 10,
    sortBy = 'dateCreated',
    sortDirection = SortDirection.Asc,
  }: GetMessagesRequest): Promise<Page<Message>> {
    const totalRecords = await this.messages.countDocuments();

    const skip = page * pageSize;
    const limit = pageSize;
    const sort: Sort = {
      [sortBy]: sortDirection === 'asc' ? 1 : -1,
    };

    const records = await this.messages
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
}
