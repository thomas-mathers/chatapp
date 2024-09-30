import Message from '../models/message';
import * as MessageRepository from '../repositories/messageRepository';

export async function createMessage(
  accountId: string,
  accountUsername: string,
  content: string,
): Promise<Message> {
  const message = await MessageRepository.createMessage({
    accountId,
    accountUsername,
    content,
    dateCreated: new Date(),
  });

  return message;
}

export async function getMessages(): Promise<Message[]> {
  const messages = await MessageRepository.getMessages();
  return messages;
}
