import { ChatAppLogger } from 'chatapp.logging';
import {
  CreateMessageRequest,
  createMessageRequestSchema,
} from 'chatapp.message-service-contracts';
import { Router } from 'express';
import { Instance } from 'express-ws';

import { MessageService } from '../services/messageService';

export class RealtimeController {
  private _router = Router();

  constructor(
    readonly messageService: MessageService,
    readonly expressWsInstance: Instance,
    readonly logger: ChatAppLogger,
  ) {
    expressWsInstance.applyTo(this._router);

    const wss = expressWsInstance.getWss();

    this._router.ws('/realtime', (ws, req) => {
      ws.on('close', () => {
        logger.info('Client disconnected', {
          accountId: req.accountId,
          accountUsername: req.accountUsername,
        });
      });

      ws.on('message', async (json: string) => {
        try {
          const createMessageRequest: CreateMessageRequest = JSON.parse(json);

          createMessageRequestSchema.parse(createMessageRequest);

          const message = await messageService.createMessage(
            req.accountId,
            req.accountUsername,
            createMessageRequest.content,
          );

          wss.clients.forEach((client) => {
            client.send(JSON.stringify(message));
          });
        } catch (error) {
          this.logger.error('Error processing realtime message', {
            accountId: req.accountId,
            accountUsername: req.accountUsername,
            error: error,
          });
        }
      });

      logger.info('Client connected', {
        accountId: req.accountId,
        accountUsername: req.accountUsername,
      });
    });
  }

  get router(): Router {
    return this._router;
  }
}
