import {
  GetMessagesRequest,
  getMessagesRequestSchema,
} from 'chatapp.message-service-contracts';
import { handleRequestValidationMiddleware } from 'chatapp.middlewares';
import { Request, Response, Router } from 'express';

import * as MessageService from '../services/messageService';

const router = Router();

/**
 * @openapi
 * /:
 *   get:
 *     description: Gets the list of messages.
 *     responses:
 *       200:
 *         description: Returns the list of messages.
 *       401:
 *         description: Unauthorized.
 */
router.get(
  '/',
  handleRequestValidationMiddleware(getMessagesRequestSchema),
  async (req: Request, res: Response) => {
    const queryOptions: GetMessagesRequest = req.body();
    const page = await MessageService.getMessages(queryOptions);
    res.json(page);
  },
);

export default router;
