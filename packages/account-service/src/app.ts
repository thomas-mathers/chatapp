import bodyParser from 'body-parser';
import { EventBus } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';
import { handleErrorMiddleware } from 'chatapp.middlewares';
import cors from 'cors';
import express from 'express';
import { Server } from 'http';
import { Db, MongoClient } from 'mongodb';
import { RedisClientType, createClient } from 'redis';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { Config } from './config';
import { AccountController } from './controllers/accountController';
import { AuthController } from './controllers/authController';
import { OAuth2Controller } from './controllers/oauth2Controller';
import { Account } from './models/account';
import { ExternalAccount } from './models/externalAccount';
import { AccountRepository } from './repositories/accountRepository';
import { AuthCodeRepository } from './repositories/authCodeRepository';
import { ExternalAccountRepository } from './repositories/externalAccountRepository';
import { AccountService } from './services/accountService';
import { AuthService } from './services/authService';
import { ExternalAccountService } from './services/externalAccountService';

const swaggerDoc = swaggerJsdoc({
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: 'Account Service',
      version: '1.0.0',
      description: 'Account Service API',
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

    const mongoDatabase = mongoClient.db(config.mongo.databaseName);

    await this.setupMongoIndexes(mongoDatabase);

    return mongoClient;
  }

  private static async setupMongoIndexes(mongoDatabase: Db): Promise<void> {
    const accountsCollection = mongoDatabase.collection<Account>('accounts');

    await accountsCollection.createIndex({ username: 1 }, { unique: true });
    await accountsCollection.createIndex({ email: 1 }, { unique: true });

    const externalAccountsCollection =
      mongoDatabase.collection<ExternalAccount>('externalAccounts');

    await externalAccountsCollection.createIndex(
      { provider: 1, providerAccountId: 1 },
      { unique: true },
    );
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

    const accountCollection = mongoDatabase.collection<Account>('accounts');
    const accountRepository = new AccountRepository(accountCollection);
    const accountService = new AccountService(
      config,
      logger,
      accountRepository,
      eventBus,
    );
    const accountController = new AccountController(config, accountService);

    const authCodeRepository = new AuthCodeRepository(redisClient);

    const authService = new AuthService(
      config,
      logger,
      accountRepository,
      eventBus,
      authCodeRepository,
    );
    const authController = new AuthController(config, authService);

    const externalAccountCollection =
      mongoDatabase.collection<ExternalAccount>('externalAccounts');
    const externalAccountRepository = new ExternalAccountRepository(
      externalAccountCollection,
    );
    const externalAccountService = new ExternalAccountService(
      externalAccountRepository,
      accountService,
    );
    const oauth2Controller = new OAuth2Controller(
      config,
      externalAccountService,
      authService,
    );

    const httpServer = express()
      .use(cors())
      .use(bodyParser.json())
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
