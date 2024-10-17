import bodyParser from 'body-parser';
import { verifyJwt } from 'chatapp.crypto';
import { Logger } from 'chatapp.logging';
import { createMessageRequestSchema } from 'chatapp.message-service-contracts';
import {
  handleAuthMiddleware,
  handleErrorMiddleware,
} from 'chatapp.middlewares';
import cors from 'cors';
import express from 'express';
import { IncomingMessage, Server } from 'http';
import { Db, MongoClient } from 'mongodb';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'url';
import { WebSocketServer } from 'ws';

import { Config } from './config';
import { MessageController } from './controllers/messageController';
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

function getAuthorizationToken(request: IncomingMessage): string | undefined {
  const { query } = parse(request.url!, true);
  const token = query.token;

  if (typeof token === 'string') {
    return token;
  }

  return undefined;
}

function launchWebSocketServer(
  config: Config,
  logger: Logger,
  messageService: MessageService,
): WebSocketServer {
  const webSocketServer = new WebSocketServer({ port: 3002 });

  webSocketServer.on('connection', (webSocket, request) => {
    logger.info(`${request.socket.remoteAddress} connected`);

    const token = getAuthorizationToken(request);

    if (token === undefined) {
      webSocket.close();
      return;
    }

    const userCredentials = verifyJwt(token, config.jwt);

    if (userCredentials === undefined) {
      webSocket.close();
      return;
    }

    webSocket.on('message', async (payload) => {
      try {
        const createMessageRequest = createMessageRequestSchema.parse(
          JSON.parse(payload.toString()),
        );

        const message = await messageService.createMessage(
          userCredentials.userId,
          userCredentials.username,
          createMessageRequest.content,
        );

        webSocketServer.clients.forEach((client) => {
          client.send(JSON.stringify(message));
        });
      } catch (error) {
        logger.error(
          `Exception while processing message from ${userCredentials.userId}`,
          {
            userCredentials,
            error,
          },
        );
      }
    });

    webSocket.on('close', () => {
      logger.info(`${userCredentials.username} disconnected`);
    });
  });

  return webSocketServer;
}

export class App {
  private constructor(
    private readonly _logger: Logger,
    private readonly _httpServer: Server,
    private readonly _mongoClient: MongoClient,
    private readonly _mongoDatabase: Db,
    private readonly _webSocketServer: WebSocketServer,
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

    const webSocketServer = launchWebSocketServer(
      config,
      logger,
      messageService,
    );

    const httpServer = express()
      .use(cors())
      .use(bodyParser.json())
      .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
      .use(handleAuthMiddleware(config.jwt))
      .use('/messages', messageController.router)
      .use(handleErrorMiddleware)
      .listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
      });

    return new App(
      logger,
      httpServer,
      mongoClient,
      mongoDatabase,
      webSocketServer,
    );
  }

  async dropDatabase() {
    await this._mongoDatabase.dropDatabase();
  }

  async close() {
    await this.closeHttpServer();
    await this.closeWebSocketServer();
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

  private closeWebSocketServer(): Promise<void> {
    return new Promise<void>((resolve) => {
      this._webSocketServer.close(() => {
        this._logger.info('WebSocket server closed');
        resolve();
      });
    });
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
