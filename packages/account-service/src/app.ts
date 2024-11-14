import bodyParser from 'body-parser';
import { FileStorageServiceClient, HttpClient } from 'chatapp.api-clients';
import { EventBus } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';
import { handleErrorMiddleware } from 'chatapp.middlewares';
import cors from 'cors';
import express from 'express';
import { Server } from 'http';
import { MongoClient } from 'mongodb';
import multer from 'multer';
import { RedisClientType, createClient } from 'redis';
import swaggerUi from 'swagger-ui-express';

import { Config } from './config';
import {
  AccountController,
  AuthController,
  OAuth2Controller,
} from './controllers';
import { Account } from './models/account';
import { AccountRepository, AuthCodeRepository } from './repositories';
import { AccountService, AuthService } from './services';
import { swaggerDoc } from './swaggerDoc';

export class App {
  private constructor(
    private readonly _config: Config,
    private readonly _logger: Logger,
    private readonly _httpServer: Server,
    private readonly _eventBus: EventBus,
    private readonly _mongoClient: MongoClient,
    private readonly _redisClient: RedisClientType,
  ) {}

  static async launch(config: Config): Promise<App> {
    const logger = new Logger({ level: config.logging.level });

    const [mongoClient, eventBus, redisClient] = await Promise.all([
      this.setupMongoClient(config),
      this.setupEventBus(config, logger),
      this.setupRedisClient(config),
    ]);

    const httpServer = await this.setupHttpServer(
      config,
      logger,
      mongoClient,
      eventBus,
      redisClient,
    );

    return new App(
      config,
      logger,
      httpServer,
      eventBus,
      mongoClient,
      redisClient,
    );
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

    const accountsCollection = mongoDatabase.collection<Account>('accounts');

    await accountsCollection.createIndex({ username: 1 }, { unique: true });
    await accountsCollection.createIndex({ email: 1 }, { unique: true });
  }

  private static async setupEventBus(
    config: Config,
    logger: Logger,
  ): Promise<EventBus> {
    const eventBus = new EventBus(
      logger,
      config.rabbitMq.url,
      config.rabbitMq.exchangeName,
    );

    await eventBus.connect();

    return eventBus;
  }

  private static async setupRedisClient(
    config: Config,
  ): Promise<RedisClientType> {
    const redisClient: RedisClientType = createClient({
      url: config.redis.url,
    });

    await redisClient.connect();

    return redisClient;
  }

  private static async setupHttpServer(
    config: Config,
    logger: Logger,
    mongoClient: MongoClient,
    eventBus: EventBus,
    redisClient: RedisClientType,
  ): Promise<Server> {
    const mongoDatabase = mongoClient.db(config.mongo.databaseName);

    const fileStorageService = new FileStorageServiceClient(
      new HttpClient(config.fileStorageService.url),
    );

    const accountCollection = mongoDatabase.collection<Account>('accounts');
    const accountRepository = new AccountRepository(accountCollection);
    const accountService = new AccountService(
      config,
      logger,
      accountRepository,
      eventBus,
    );

    const accountController = new AccountController(
      config,
      accountService,
      fileStorageService,
    );

    const authCodeRepository = new AuthCodeRepository(redisClient);

    const authService = new AuthService(
      config,
      logger,
      accountRepository,
      eventBus,
      authCodeRepository,
    );
    const authController = new AuthController(config, authService);

    const oauth2Controller = new OAuth2Controller(
      config,
      accountService,
      authService,
    );

    const httpServer = express()
      .use(cors())
      .use(bodyParser.json())
      .use(
        multer({
          limits: { fileSize: config.fileStorageService.maxFileSize },
        }).single('file'),
      )
      .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
      .use('/accounts', accountController.router)
      .use('/auth', authController.router)
      .use('/oauth2', oauth2Controller.router)
      .use(handleErrorMiddleware)
      .listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
      });

    return httpServer;
  }

  async close() {
    await this.closeHttpServer();
    await this.closeEventBus();
    await this.closeMongoClient();
    await this.closeRedisClient();
  }

  get config() {
    return this._config;
  }

  get httpServer() {
    return this._httpServer;
  }

  get mongoDatabase() {
    return this._mongoClient.db(this._config.mongo.databaseName);
  }

  private async closeHttpServer() {
    return new Promise<void>((resolve) => {
      this._httpServer.close(() => {
        this._logger.info('HTTP server closed');
        resolve();
      });
    });
  }

  private async closeEventBus() {
    await this._eventBus.close();
    this._logger.info('Event bus closed');
  }

  private async closeMongoClient(): Promise<void> {
    await this._mongoClient.close();
    this._logger.info('Mongo client closed');
  }

  private async closeRedisClient(): Promise<void> {
    await this._redisClient.quit();
    this._logger.info('Redis client closed');
  }
}
