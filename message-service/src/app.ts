import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import env from '../env';
import MessageRepository from './repositories/messageRepository';
import MessageService from './services/messageService';
import jwtMiddleware from './middlewares/jwtMiddleware';

const { app, getWss } = expressWs(express());

const wss = getWss();

const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository, wss);

app.use(bodyParser.json());
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerJsdoc({
      swaggerDefinition: {
        openapi: '3.0.0',
        info: { title: 'Message Service', version: '1.0.0' },
      },
      apis: ['src/**/*.ts'],
    }),
  ),
);
app.use(jwtMiddleware);

app.ws('/realtime', (ws, req) => {
  ws.on('message', (message: string) => {
    messageService.createMessage(req.accountId as string, message);
  });
});

/**
 * @openapi
 * /messages:
 *   get:
 *     description: Gets the list of messages.
 *     responses:
 *       200:
 *         description: Returns the list of messages.
 *       401:
 *         description: Unauthorized.
 */
app.get('/messages', (req: Request, res: Response) => {
  const { statusCode, data } = messageService.getMessages();
  res.status(statusCode).json(data);
});

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
