import { verifyJwt } from 'chatapp.crypto';
import { Logger } from 'chatapp.logging';
import { createMessageRequestSchema } from 'chatapp.message-service-contracts';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { WebSocket, WebSocketServer } from 'ws';

import { Config } from './config';
import { MessageService } from './services/messageService';

function getAuthorizationToken(request: IncomingMessage): string | undefined {
  const { query } = parse(request.url!, true);
  const token = query.token;

  if (typeof token === 'string') {
    return token;
  }

  return undefined;
}

export class ChatServer {
  private readonly webSocketServer: WebSocketServer;
  private readonly userSockets: Map<string, WebSocket> = new Map();

  constructor(
    config: Config,
    private readonly logger: Logger,
    messageService: MessageService,
  ) {
    this.webSocketServer = new WebSocketServer({ port: config.wss.port });

    this.webSocketServer.on('connection', (webSocket: WebSocket, request) => {
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

      this.userSockets.set(userCredentials.userId, webSocket);

      webSocket.on('message', async (payload) => {
        try {
          const createMessageRequest = createMessageRequestSchema.parse(
            JSON.parse(payload.toString()),
          );

          const message = await messageService.createMessage(
            userCredentials.userId,
            createMessageRequest.content,
          );

          this.webSocketServer.clients.forEach((client) => {
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
        this.userSockets.delete(userCredentials.userId);

        logger.info(`${userCredentials.username} disconnected`);
      });
    });
  }

  get users(): string[] {
    return Array.from(this.userSockets.keys());
  }

  public close(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.webSocketServer.close(() => {
        this.logger.info('WebSocket server closed');
        resolve();
      });
    });
  }
}
