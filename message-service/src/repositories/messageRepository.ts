import Message from '../models/message';

export default class MessageRepository {
  private messages: Message[];

  constructor(messages: Message[] = []) {
    this.messages = messages;
  }

  createMessage(message: Message): Message {
    this.messages.push(message);
    return message;
  }

  getMessages(): Message[] {
    return this.messages
      .slice()
      .sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());
  }
}
