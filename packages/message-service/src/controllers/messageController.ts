import {
  CreateMessageRequest,
  getMessagesRequestSchema,
} from 'chatapp.message-service-contracts';
import { handleRequestQueryValidationMiddleware } from 'chatapp.middlewares';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { MessageService } from '../services/messageService';

export class MessageController {
  private _router = Router();

  constructor(readonly messageService: MessageService) {
    this._router.get(
      '/',
      handleRequestQueryValidationMiddleware(getMessagesRequestSchema),
      async (req: Request, res: Response) => {
        const getMessagesRequest = getMessagesRequestSchema.parse(req.query);
        const result = await messageService.getMessages(getMessagesRequest);
        res.status(StatusCodes.OK).json(result);
      },
    );

    this._router.post('/', async (req: Request, res: Response) => {
      const body: CreateMessageRequest = req.body;
      const result = await messageService.createMessage(
        req.accountId,
        req.accountUsername,
        body.content,
      );
      res.status(StatusCodes.OK).json(result);
    });
  }

  get router(): Router {
    return this._router;
  }
}
