import { Router } from 'express';
import { Server } from 'ws';

import CreateMessageRequest, {
  createMessageRequestSchema,
} from '../requests/createMessageRequest';
import * as MessageService from '../services/messageService';

export function realtimeController(getWss: () => Server) {
  const router = Router();

  router.ws('/realtime', (ws, req) => {
    ws.on('message', async (createMessageRequest: CreateMessageRequest) => {
      try {
        const { success } =
          createMessageRequestSchema.safeParse(createMessageRequest);

        if (!success) {
          ws.send(JSON.stringify({ error: 'Invalid request' }));
          return;
        }

        const message = await MessageService.createMessage(
          req.accountId,
          req.accountUsername,
          createMessageRequest.content,
        );

        getWss().clients.forEach((client) => {
          client.send(JSON.stringify(message));
        });
      } catch (error) {
        console.error('Error processing realtime message:', error);
      }
    });
  });

  return router;
}
