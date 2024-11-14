import bodyParser from 'body-parser';
import { AccountServiceClient, HttpClient } from 'chatapp.api-clients';
import { Logger } from 'chatapp.logging';
import {
  handleErrorMiddleware,
  handleJwtAuthMiddleware,
} from 'chatapp.middlewares';
import cors from 'cors';
import express from 'express';
import { Server } from 'http';
import { Db, MongoClient } from 'mongodb';
import swaggerUi from 'swagger-ui-express';

import { ChatServer } from './chatServer';
import { Config } from './config';
import { MessageController } from './controllers/messageController';
import { UserController } from './controllers/userController';
import { Message } from './models/message';
import { MessageRepository } from './repositories/messageRepository';
import { MessageService } from './services/messageService';
import { swaggerDoc } from './swaggerDoc';

export class App {
  private constructor(
    private readonly _config: Config,
    private readonly _logger: Logger,
    private readonly _httpServer: Server,
    private readonly _mongoClient: MongoClient,
    private readonly _chatServer: ChatServer,
  ) {}

  static async launch(config: Config): Promise<App> {
    const logger = new Logger({ level: config.logging.level });

    const mongoClient = await this.setupMongoClient(config);

    const mongoDatabase = mongoClient.db(config.mongo.databaseName);

    const accountServiceClient = new AccountServiceClient(
      new HttpClient(config.accountService.url),
    );

    const messagesCollection = mongoDatabase.collection<Message>('messages');
    const messageRepository = new MessageRepository(messagesCollection);
    const messageService = new MessageService(
      config,
      messageRepository,
      accountServiceClient,
    );
    const messageController = new MessageController(messageService);

    const chatServer = new ChatServer(config, logger, messageService);

    const userController = new UserController(chatServer);

    const httpServer = express()
      .use(cors())
      .use(bodyParser.json())
      .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
      .use(handleJwtAuthMiddleware(config.jwt))
      .use('/messages', messageController.router)
      .use('/users', userController.router)
      .use(handleErrorMiddleware)
      .listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
      });

    return new App(config, logger, httpServer, mongoClient, chatServer);
  }

  private static async setupMongoClient(config: Config): Promise<MongoClient> {
    const mongoClient = new MongoClient(config.mongo.uri);
    await mongoClient.connect();

    await this.setupMongoIndexes(config, mongoClient);

    return mongoClient;
  }

  private static async setupMongoIndexes(
    config: Config,
    mongoClient: MongoClient,
  ): Promise<void> {
    const mongoDatabase = mongoClient.db(config.mongo.databaseName);

    const messagesCollection = mongoDatabase.collection<Message>('messages');

    await messagesCollection.createIndex({ accountId: 1 });
    await messagesCollection.createIndex({ username: 1 });
    await messagesCollection.createIndex({ dateCreated: 1 });
  }

  async dropDatabase() {
    await this.mongoDatabase.dropDatabase();
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
    return this._mongoClient.db(this._config.mongo.databaseName);
  }
}
