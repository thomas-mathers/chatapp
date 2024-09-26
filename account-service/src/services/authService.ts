import { StatusCodes } from 'http-status-codes';

import jwt from 'jsonwebtoken';

import { Result, success, failure } from '../statusCodeResult';

import LoginRequest from '../requests/loginRequest';
import LoginResponse from '../responses/loginResponse';

import AccountService from './accountService';

export default class AuthService {
  private accountService: AccountService;
  private secret: string;

  constructor(accountService: AccountService, secret: string) {
    this.accountService = accountService;
    this.secret = secret;
  }

  login(request: LoginRequest): Result<LoginResponse> {
    const result = this.accountService.getAccountById(request.id);
    if (!result.isSuccess) {
      return failure(result.statusCode);
    }
    if (result.data.password !== request.password) {
      return failure(StatusCodes.UNAUTHORIZED);
    }
    const token = jwt.sign({ sub: result.data.id }, this.secret);
    return success({ jwt: token });
  }
}
