import {
  GetMessagesRequest,
  MessageSummary,
  Page,
} from 'chatapp.message-service-contracts';

import { Message } from '../models/message';
import { MessageRepository } from '../repositories/messageRepository';

export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async createMessage(
    accountId: string,
    accountUsername: string,
    content: string,
  ): Promise<MessageSummary> {
    const message = await this.messageRepository.createMessage({
      accountId,
      accountUsername,
      content,
      dateCreated: new Date(),
    });

    return toMessageSummary(message);
  }

  async getMessages(req: GetMessagesRequest): Promise<Page<MessageSummary>> {
    const page = await this.messageRepository.getMessages(req);
    return {
      ...page,
      records: page.records.map(toMessageSummary),
    };
  }
}

export function toMessageSummary(message: Message): MessageSummary {
  const { _id, accountId, accountUsername, content, dateCreated } = message;
  return {
    id: _id!,
    accountId,
    accountUsername,
    content,
    dateCreated,
  };
}
