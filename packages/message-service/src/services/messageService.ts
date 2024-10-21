import { ApiResult, ok } from 'chatapp.api-result';
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
  ): Promise<ApiResult<MessageSummary>> {
    const message = await this.messageRepository.createMessage({
      accountId,
      accountUsername,
      content,
      dateCreated: new Date(),
    });

    return ok(toMessageSummary(message));
  }

  async getMessages(
    req: GetMessagesRequest,
  ): Promise<ApiResult<Page<MessageSummary>>> {
    const page = await this.messageRepository.getMessages(req);
    return ok({
      ...page,
      records: page.records.map(toMessageSummary),
    });
  }
}

export function toMessageSummary(message: Message): MessageSummary {
  const { _id, accountId, accountUsername, content, dateCreated } = message;
  return {
    id: _id!,
    accountId,
    accountUsername,
    content,
    dateCreated: dateCreated.toISOString(),
  };
}
