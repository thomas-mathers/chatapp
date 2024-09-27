import { Result, success } from '../statusCodeResult';
import Message from '../models/message';
import * as MessageRepository from '../repositories/messageRepository';

export function createMessage(
  accountId: string,
  content: string,
): Result<Message> {
  const message = MessageRepository.createMessage(
    new Message(accountId, content),
  );

  return success(message, 201);
}

export function getMessages(): Result<Message[]> {
  return success(MessageRepository.getMessages());
}
