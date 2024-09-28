import { v4 as uuidv4 } from 'uuid';

import Message from '@app/models/message';
import * as MessageRepository from '@app/repositories/messageRepository';
import { Result, success } from '@app/statusCodeResult';

export function createMessage(
  accountId: string,
  content: string,
): Result<Message> {
  const message = MessageRepository.createMessage({
    id: uuidv4(),
    accountId,
    content: content,
    dateCreated: new Date(),
  });

  return success(message, 201);
}

export function getMessages(): Result<Message[]> {
  return success(MessageRepository.getMessages());
}
