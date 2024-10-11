import { EventService } from 'chatapp.event-sourcing';
import { LogLevel, Logger } from 'chatapp.logging';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

import { Config, configSchema } from './config';
import { AccountController } from './controllers/accountController';
import { AuthController } from './controllers/authController';
import { Account } from './models/account';
import { AccountRepository } from './repositories/accountRepository';
import { AccountService } from './services/accountService';
import { AuthService } from './services/authService';
import { createIndexes } from './setupDatabase';

export interface Services {
  accountController: AccountController;
  authController: AuthController;
  config: Config;
  logger: Logger;
  mongoClient: MongoClient;
}

export async function setupServices() {
  dotenv.config({
    path: process.env.NODE_ENV ? `${process.env.NODE_ENV}.env` : '.env',
  });

  const config = configSchema.parse(process.env);

  const logger = new Logger({
    level: config.logging.level as LogLevel,
  });

  const eventProducerService = new EventService(
    logger,
    config.rabbitMq.url,
    config.rabbitMq.exchangeName,
    {},
  );

  await eventProducerService.connect();

  const mongoClient = new MongoClient(config.mongo.uri);

  await mongoClient.connect();

  await createIndexes(mongoClient);

  const accountRepository = new AccountRepository(
    mongoClient.db().collection<Account>('accounts'),
  );
  const accountService = new AccountService(logger, accountRepository);
  const accountController = new AccountController(config, accountService);

  const authService = new AuthService(
    config,
    logger,
    accountRepository,
    eventProducerService,
  );
  const authController = new AuthController(config, authService);

  return {
    accountController,
    authController,
    config,
    logger,
    mongoClient,
  };
}
