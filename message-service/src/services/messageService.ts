import WebSocket from 'ws';
import { Result, success } from '../statusCodeResult';
import Message from '../models/message';
import MessageRepository from '../repositories/messageRepository';

export default class MessageService {
  private messageRepository: MessageRepository;
  private wss: WebSocket.Server;

  constructor(messageRepository: MessageRepository, wss: WebSocket.Server) {
    this.messageRepository = messageRepository;
    this.wss = wss;
  }

  createMessage(accountId: string, content: string): Result<Message> {
    const message = this.messageRepository.createMessage(
      new Message(accountId, content),
    );

    this.wss.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });

    return success(message, 201);
  }

  getMessages(): Result<Message[]> {
    return success(this.messageRepository.getMessages());
  }
}
