import { Request, Response, Router } from 'express';

import * as MessageService from '@app/services/messageService';

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
router.get('/', (req: Request, res: Response) => {
  const { statusCode, data } = MessageService.getMessages();
  res.status(statusCode).json(data);
});

export default router;
