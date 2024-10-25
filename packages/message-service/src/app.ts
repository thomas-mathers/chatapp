import bodyParser from 'body-parser';
import { Logger } from 'chatapp.logging';
import {
  handleAuthMiddleware,
  handleErrorMiddleware,
} from 'chatapp.middlewares';
import cors from 'cors';
import express from 'express';
import { Server } from 'http';
import { Db, MongoClient } from 'mongodb';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { ChatServer } from './chatServer';
import { Config } from './config';
import { MessageController } from './controllers/messageController';
import { UserController } from './controllers/userController';
import { Message } from './models/message';
import { MessageRepository } from './repositories/messageRepository';
import { MessageService } from './services/messageService';

const swaggerDoc = swaggerJsdoc({
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: 'Message Service',
      version: '1.0.0',
      description: 'Message Service API',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['**/controllers/*.{ts,js}'],
});

export class App {
  private constructor(
    private readonly _logger: Logger,
    private readonly _httpServer: Server,
    private readonly _mongoClient: MongoClient,
    private readonly _mongoDatabase: Db,
    private readonly _chatServer: ChatServer,
  ) {}

  static async launch(config: Config): Promise<App> {
    const logger = new Logger({ level: config.logging.level });

    const mongoClient = new MongoClient(config.mongo.uri);
    await mongoClient.connect();

    const mongoDatabase = mongoClient.db(config.mongo.databaseName);

    const messagesCollection = mongoDatabase.collection<Message>('messages');

    await messagesCollection.createIndex({ accountId: 1 });
    await messagesCollection.createIndex({ accountUsername: 1 });
    await messagesCollection.createIndex({ dateCreated: 1 });

    const messageRepository = new MessageRepository(messagesCollection);
    const messageService = new MessageService(messageRepository);
    const messageController = new MessageController(messageService);

    const chatServer = new ChatServer(config, logger, messageService);

    const userController = new UserController(chatServer);

    const httpServer = express()
      .use(cors())
      .use(bodyParser.json())
      .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
      .use(handleAuthMiddleware(config.jwt))
      .use('/messages', messageController.router)
      .use('/users', userController.router)
      .use(handleErrorMiddleware)
      .listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
      });

    return new App(logger, httpServer, mongoClient, mongoDatabase, chatServer);
  }

  async dropDatabase() {
    await this._mongoDatabase.dropDatabase();
  }

  async close() {
    await this.closeHttpServer();
    await this.closeChatServer();
    await this.closeMongoClient();
  }

  private closeHttpServer(): Promise<void> {
    return new Promise<void>((resolve) => {
      this._httpServer.close(() => {
        this._logger.info('HTTP server closed');
        resolve();
      });
    });
  }

  private async closeChatServer(): Promise<void> {
    await this._chatServer.close();
  }

  private async closeMongoClient(): Promise<void> {
    await this._mongoClient.close();
    this._logger.info('Mongo client closed');
  }

  get httpServer(): Server {
    return this._httpServer;
  }

  get mongoDatabase(): Db {
    return this._mongoDatabase;
  }
}
