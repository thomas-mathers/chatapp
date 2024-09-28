import { StatusCodes } from 'http-status-codes';

import jwt from 'jsonwebtoken';

import env from '@app/env';

import { Result, success, failure } from '@app/statusCodeResult';

import LoginRequest from '@app/requests/loginRequest';
import LoginResponse from '@app/responses/loginResponse';

import * as AccountService from './accountService';

export function login(request: LoginRequest): Result<LoginResponse> {
  const result = AccountService.getAccountById(request.id);
  if (!result.isSuccess) {
    return failure(result.statusCode);
  }
  if (result.data.password !== request.password) {
    return failure(StatusCodes.UNAUTHORIZED);
  }
  const nowInSeconds = Date.now() / 1000;
  const payload = {
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
    sub: result.data.id,
    exp: nowInSeconds + env.JWT_EXPIRATION_TIME_IN_SECONDS,
    iat: nowInSeconds,
  };
  const token = jwt.sign(payload, env.JWT_SECRET);
  return success({ jwt: token });
}
