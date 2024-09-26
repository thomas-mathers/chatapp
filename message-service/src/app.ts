import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import MessageRepository from './repositories/messageRepository';
import MessageService from './services/messageService';
import jwtMiddleware from './middlewares/jwtMiddleware';

dotenv.config();

const { app, getWss } = expressWs(express());

const wss = getWss();

const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository, wss);

app.use(bodyParser.json());
app.use(jwtMiddleware);

app.ws('/', (ws, req) => {
  ws.on('message', (message: string) => {
    messageService.createMessage(req.accountId as string, message);
  });
});

app.get('/messages', (req: Request, res: Response) => {
  const { statusCode, data } = messageService.getMessages();
  res.status(statusCode).json(data);
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
