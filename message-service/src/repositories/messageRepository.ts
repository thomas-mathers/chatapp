import Message from '../models/message';

const messages: Message[] = [];

export function createMessage(message: Message): Message {
  messages.push(message);
  return message;
}

export function getMessages(): Message[] {
  return messages
    .slice()
    .sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());
}
