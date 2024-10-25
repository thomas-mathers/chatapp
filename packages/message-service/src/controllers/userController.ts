import { ok } from 'chatapp.api-result';
import { Router } from 'express';

import { ChatServer } from '../chatServer';

export class UserController {
  private _router = Router();

  constructor(chatServer: ChatServer) {
    this._router.get('/', (req, res) => {
      const usersResult = ok(chatServer.users);
      res.status(usersResult.statusCode).json(usersResult);
    });
  }

  get router(): Router {
    return this._router;
  }
}
