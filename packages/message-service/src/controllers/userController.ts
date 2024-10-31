import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ChatServer } from '../chatServer';

export class UserController {
  private _router = Router();

  constructor(chatServer: ChatServer) {
    this._router.get('/', (req, res) => {
      res.status(StatusCodes.OK).json(chatServer.users);
    });
  }

  get router(): Router {
    return this._router;
  }
}
