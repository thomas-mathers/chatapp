import bodyParser from 'body-parser';
import { verifyJwt } from 'chatapp.crypto';
import { Logger } from 'chatapp.logging';
import { createMessageRequestSchema } from 'chatapp.message-service-contracts';
import {
  handleAuthMiddleware,
  handleErrorMiddleware,
} from 'chatapp.middlewares';
import express from 'express';
import { IncomingMessage, Server } from 'http';
import { Db, MongoClient } from 'mongodb';
import internal from 'stream';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { WebSocketServer } from 'ws';

import { Config, parseConfigFromFile } from './config';
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

  const messagesCollection = mongoDatabase.collection<Message>('messages');

  await messagesCollection.createIndex({ accountId: 1 });
  await messagesCollection.createIndex({ accountUsername: 1 });
  await messagesCollection.createIndex({ dateCreated: 1 });

  return { mongoClient, mongoDatabase };
}

function getAuthorizationToken(request: IncomingMessage): string | undefined {
  const authorizationSegments = request.headers.authorization?.split(' ') ?? [];

  if (
    authorizationSegments.length !== 2 ||
    authorizationSegments[0] !== 'Bearer'
  ) {
    return undefined;
  }

  return authorizationSegments[1];
}

function handleUpgrade(config: Config, webSocketServer: WebSocketServer) {
  return (request: IncomingMessage, socket: internal.Duplex, head: Buffer) => {
    const token = getAuthorizationToken(request);

    if (token === undefined) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    const userCredentials = verifyJwt(token, config.jwt);

    if (userCredentials === undefined) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    request.accountId = userCredentials.userId;
    request.accountUsername = userCredentials.username;

    webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
      webSocketServer.emit('connection', webSocket, request);
    });
  };
}

export function launchWebSocketServer(
  logger: Logger,
  messageService: MessageService,
): WebSocketServer {
  const webSocketServer = new WebSocketServer({ noServer: true });

  webSocketServer.on('connection', (webSocket, request) => {
    logger.info(`${request.accountUsername} connected`);

    webSocket.on('message', async (payload) => {
      try {
        const createMessageRequest = createMessageRequestSchema.parse(
          JSON.parse(payload.toString()),
        );

        const message = await messageService.createMessage(
          request.accountId,
          request.accountUsername,
          createMessageRequest.content,
        );

        webSocketServer.clients.forEach((client) => {
          client.send(JSON.stringify(message));
        });
      } catch (error) {
        logger.error(
          `Exception while processing message from ${request.accountId}`,
          {
            accountId: request.accountId,
            accountUsername: request.accountUsername,
            error,
          },
        );
      }
    });

    webSocket.on('close', () => {
      logger.info(`${request.accountUsername} disconnected`);
    });
  });

  return webSocketServer;
}

export function launchHttpServer(
  config: Config,
  logger: Logger,
  messageService: MessageService,
  webSocketServer: WebSocketServer,
): Server {
  const messageController = new MessageController(messageService);

  return express()
    .use(bodyParser.json())
    .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
    .use(handleAuthMiddleware(config.jwt))
    .use('/messages', messageController.router)
    .use(handleErrorMiddleware)
    .listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    })
    .on('upgrade', handleUpgrade(config, webSocketServer));
}

async function main() {
  const config = parseConfigFromFile(
    process.env.NODE_ENV === 'test' ? 'test.env' : '.env',
  );

  const logger = new Logger({ level: config.logging.level });

  const { mongoDatabase } = await setupDatabase(config);

  const messagesCollection = mongoDatabase.collection<Message>('messages');

  const messageRepository = new MessageRepository(messagesCollection);
  const messageService = new MessageService(messageRepository);

  const webSocketServer = launchWebSocketServer(logger, messageService);

  launchHttpServer(config, logger, messageService, webSocketServer);
}

main();
