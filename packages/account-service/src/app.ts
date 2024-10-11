import bodyParser from 'body-parser';
import { EventBus } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';
import { handleErrorMiddleware } from 'chatapp.middlewares';
import express from 'express';
import { Server } from 'http';
import { Db, MongoClient } from 'mongodb';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { Config, parseConfigFromFile } from './config';
import { AccountController } from './controllers/accountController';
import { AuthController } from './controllers/authController';
import { Account } from './models/account';
import { AccountRepository } from './repositories/accountRepository';
import { AccountService } from './services/accountService';
import { AuthService } from './services/authService';

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

export async function setupDatabase(
  config: Config,
  databaseName: string | undefined = undefined,
): Promise<{
  mongoClient: MongoClient;
  mongoDatabase: Db;
}> {
  const mongoClient = new MongoClient(config.mongo.uri);
  await mongoClient.connect();

  const mongoDatabase = mongoClient.db(databaseName);

  const accountsCollection = mongoDatabase.collection<Account>('accounts');

  await accountsCollection.createIndex({ username: 1 }, { unique: true });
  await accountsCollection.createIndex({ email: 1 }, { unique: true });

  return { mongoClient, mongoDatabase };
}

export async function setupEventBus(
  logger: Logger,
  config: Config,
): Promise<EventBus> {
  const eventBus = new EventBus(
    logger,
    config.rabbitMq.url,
    config.rabbitMq.exchangeName,
  );

  await eventBus.connect();

  return eventBus;
}

export function launchHttpServer(
  config: Config,
  logger: Logger,
  mongoDatabase: Db,
  eventBus: EventBus,
): Server {
  const accountsCollection = mongoDatabase.collection<Account>('accounts');

  const accountRepository = new AccountRepository(accountsCollection);
  const accountService = new AccountService(logger, accountRepository);
  const accountController = new AccountController(config, accountService);

  const authService = new AuthService(
    config,
    logger,
    accountRepository,
    eventBus,
  );
  const authController = new AuthController(config, authService);

  return express()
    .use(bodyParser.json())
    .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
    .use('/accounts', accountController.router)
    .use('/auth', authController.router)
    .use(handleErrorMiddleware)
    .listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
}

async function main() {
  const config = parseConfigFromFile(
    process.env.NODE_ENV === 'test' ? 'test.env' : '.env',
  );

  const logger = new Logger({ level: config.logging.level });

  const { mongoDatabase } = await setupDatabase(config);

  const eventBus = await setupEventBus(logger, config);

  launchHttpServer(config, logger, mongoDatabase, eventBus);
}

main();
