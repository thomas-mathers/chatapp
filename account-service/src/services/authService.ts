import { StatusCodes } from 'http-status-codes';

import jwt from 'jsonwebtoken';

import { Result, success, failure } from '../statusCodeResult';

import LoginRequest from '../requests/loginRequest';
import LoginResponse from '../responses/loginResponse';

import AccountService from './accountService';

interface JwtConfig {
  issuer: string;
  audience: string;
  secret: string;
  expirationTimeInSeconds: number;
}

export default class AuthService {
  private accountService: AccountService;
  private config: JwtConfig;

  constructor(accountService: AccountService, config: JwtConfig) {
    this.accountService = accountService;
    this.config = config;
  }

  login(request: LoginRequest): Result<LoginResponse> {
    const result = this.accountService.getAccountById(request.id);
    if (!result.isSuccess) {
      return failure(result.statusCode);
    }
    if (result.data.password !== request.password) {
      return failure(StatusCodes.UNAUTHORIZED);
    }
    const nowInSeconds = Date.now() / 1000;
    const payload = {
      iss: this.config.issuer,
      aud: this.config.audience,
      sub: result.data.id,
      exp: nowInSeconds + this.config.expirationTimeInSeconds,
      iat: nowInSeconds,
    };
    const token = jwt.sign(payload, this.config.secret);
    return success({ jwt: token });
  }
}
