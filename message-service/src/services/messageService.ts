import {
  GetMessagesRequest,
  MessageSummary,
  Page,
} from 'chatapp.message-service-contracts';

import Message from '../models/message';
import * as MessageRepository from '../repositories/messageRepository';

export async function createMessage(
  accountId: string,
  accountUsername: string,
  content: string,
): Promise<MessageSummary> {
  const message = await MessageRepository.createMessage({
    accountId,
    accountUsername,
    content,
    dateCreated: new Date(),
  });

  return toMessageSummary(message);
}

export async function getMessages(
  req: GetMessagesRequest,
): Promise<Page<MessageSummary>> {
  const page = await MessageRepository.getMessages(req);
  return {
    ...page,
    records: page.records.map(toMessageSummary),
  };
}

function toMessageSummary(message: Message): MessageSummary {
  const { _id, accountId, accountUsername, content, dateCreated } = message;
  return { id: _id!, accountId, accountUsername, content, dateCreated };
}
