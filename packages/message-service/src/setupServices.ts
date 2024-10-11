import { LogLevel, Logger } from 'chatapp.logging';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

import { Config, configSchema } from './config';
import { MessageController } from './controllers/messageController';
import { Message } from './models/message';
import { MessageRepository } from './repositories/messageRepository';
import { MessageService } from './services/messageService';
import { createIndexes } from './setupDatabase';

export interface Services {
  config: Config;
  logger: Logger;
  messageController: MessageController;
  mongoClient: MongoClient;
}

export async function setupServices(): Promise<Services> {
  dotenv.config({
    path: process.env.NODE_ENV ? `${process.env.NODE_ENV}.env` : '.env',
  });

  const config = configSchema.parse(process.env);

  const logger = new Logger({ level: config.logging.level as LogLevel });

  const mongoClient = new MongoClient(config.mongo.uri);

  await mongoClient.connect();

  await createIndexes(mongoClient);

  const messageRepository = new MessageRepository(
    mongoClient.db().collection<Message>('messages'),
  );
  const messageService = new MessageService(messageRepository);
  const messageController = new MessageController(messageService);

  return {
    config,
    logger,
    messageController,
    mongoClient,
  };
}
