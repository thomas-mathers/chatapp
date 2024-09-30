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
router.get('/', async (req: Request, res: Response) => {
  const messages = await MessageService.getMessages();
  res.json(messages);
});

export default router;
