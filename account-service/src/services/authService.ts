import { LoginResponse } from 'chatapp.account-service-contracts';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import config from '../config';
import Account from '../models/account';
import * as AccountRepository from '../repositories/accountRepository';
import { Result, failure, success } from '../statusCodeResult';
import * as CryptoService from './cryptoService';

function createJwtForAccount(account: Account): string {
  const nowInSeconds = Date.now() / 1000;

  const payload = {
    iss: config.jwt.issuer,
    aud: config.jwt.audience,
    sub: account._id,
    exp: nowInSeconds + config.jwt.maxAgeInSeconds,
    iat: nowInSeconds,
    username: account.username,
  };

  return jwt.sign(payload, config.jwt.secret);
}

export async function login(
  username: string,
  password: string,
): Promise<Result<LoginResponse>> {
  const account = await AccountRepository.getAccountByUsername(username);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const passwordMatch = await CryptoService.verifyPassword(
    password,
    account.password,
  );

  if (!passwordMatch) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const jwt = createJwtForAccount(account);

  return success({ jwt });
}

export async function changePassword(
  id: string,
  oldPassword: string,
  newPassword: string,
): Promise<Result<void>> {
  const account = await AccountRepository.getAccountById(id);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const passwordMatch = await CryptoService.verifyPassword(
    oldPassword,
    account.password,
  );

  if (!passwordMatch) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const hash = await CryptoService.hashPassword(newPassword);

  await AccountRepository.updateAccount({ ...account, password: hash });

  return success();
}

export async function generatePasswordResetToken(
  email: string,
): Promise<Result<string>> {
  const account = await AccountRepository.getAccountByEmail(email);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const token = createJwtForAccount(account);

  return success(token);
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<Result<void>> {
  const options = {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
    maxAge: config.jwt.maxAgeInSeconds,
  };

  const { sub, username } = jwt.verify(token, config.jwt.secret, options) as {
    sub: string | undefined;
    username: string | undefined;
  };

  if (sub === undefined || username === undefined) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const account = await AccountRepository.getAccountById(sub);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const hash = await CryptoService.hashPassword(newPassword);

  await AccountRepository.updateAccount({ ...account, password: hash });

  return success();
}
