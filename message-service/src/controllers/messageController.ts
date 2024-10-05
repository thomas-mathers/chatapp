import { getMessagesRequestSchema } from 'chatapp.message-service-contracts';
import { handleRequestQueryValidationMiddleware } from 'chatapp.middlewares';
import { Request, Response, Router } from 'express';

import { getMessages } from '../services/messageService';

const router = Router();

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Retrieve a list of messages
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of messages per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, accountId, accountUsername, content, dateCreated]
 *           example: dateCreated
 *         description: Field to sort by
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: asc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: A list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       accountId:
 *                         type: string
 *                         example: "12345"
 *                       accountUsername:
 *                         type: string
 *                         example: "john_doe"
 *                       content:
 *                         type: string
 *                         example: "Hello, world!"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00.000Z"
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 10
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  handleRequestQueryValidationMiddleware(getMessagesRequestSchema),
  async (req: Request, res: Response) => {
    const getMessagesRequest = getMessagesRequestSchema.parse(req.query);
    const page = await getMessages(getMessagesRequest);
    res.json(page);
  },
);

export { router };
