import { getMessagesRequestSchema } from 'chatapp.message-service-contracts';
import { handleRequestQueryValidationMiddleware } from 'chatapp.middlewares';
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
  handleRequestQueryValidationMiddleware(getMessagesRequestSchema),
  async (req: Request, res: Response) => {
    const getMessagesRequest = getMessagesRequestSchema.parse(req.query);
    const page = await MessageService.getMessages(getMessagesRequest);
    res.json(page);
  },
);

export default router;
