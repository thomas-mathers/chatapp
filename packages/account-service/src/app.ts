import bodyParser from 'body-parser';
import { EventService } from 'chatapp.event-sourcing';
import { ChatAppLogger, LogLevel } from 'chatapp.logging';
import { handleErrorMiddleware } from 'chatapp.middlewares';
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { configSchema } from './config';
import { AccountController } from './controllers/accountController';
import { AuthController } from './controllers/authController';
import { Account } from './models/account';
import { AccountRepository } from './repositories/accountRepository';
import { AccountService } from './services/accountService';
import { AuthService } from './services/authService';

export async function launchApp() {
  const envName = process.env.NODE_ENV ?? '';
  const envFile = `${envName}.env`;

  dotenv.config({ path: envFile });

  const config = configSchema.parse(process.env);

  const logger = new ChatAppLogger({
    level: config.logging.level as LogLevel,
  });

  const databaseClient = new MongoClient(config.mongo.uri);

  await databaseClient.connect();

  const accountsCollection = databaseClient
    .db()
    .collection<Account>('accounts');

  accountsCollection.createIndex({ username: 1 }, { unique: true });
  accountsCollection.createIndex({ email: 1 }, { unique: true });

  const eventProducerService = new EventService(
    logger,
    config.rabbitMq.url,
    config.rabbitMq.exchangeName,
    {},
  );

  await eventProducerService.connect();

  const accountRepository = new AccountRepository(accountsCollection);
  const accountService = new AccountService(logger, accountRepository);
  const accountController = new AccountController(config, accountService);

  const authService = new AuthService(
    config,
    logger,
    accountRepository,
    eventProducerService,
  );
  const authController = new AuthController(config, authService);

  const app = express()
    .use(bodyParser.json())
    .use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(
        swaggerJsdoc({
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
        }),
      ),
    )
    .use('/accounts', accountController.router)
    .use('/auth', authController.router)
    .use(handleErrorMiddleware);

  app.listen(config.port, () => {
    logger.info(`Server is running on port ${config.port}`);
  });

  return app;
}

launchApp();
