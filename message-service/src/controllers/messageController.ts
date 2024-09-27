import { Router, Request, Response } from 'express';
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
router.get('/messages', (req: Request, res: Response) => {
  const { statusCode, data } = MessageService.getMessages();
  res.status(statusCode).json(data);
});

export default router;
