import bcrypt from 'bcrypt';
import {
  AccountSummary,
  CreateAccountRequest,
  LoginRequest,
  LoginResponse,
} from 'chatapp.account-service-contracts';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { MongoError } from 'mongodb';

import env from '../env';
import Account from '../models/account';
import * as AccountRepository from '../repositories/accountRepository';
import { Result, failure, success } from '../statusCodeResult';

export async function createAccount(
  request: CreateAccountRequest,
): Promise<Result<AccountSummary>> {
  try {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(request.password, salt);

    const account = await AccountRepository.createAccount({
      username: request.username,
      password: hash,
      dateCreated: new Date(),
    });

    const accountSummary = toAccountSummary(account);

    return success(accountSummary, 201);
  } catch (error) {
    if (error instanceof MongoError && error.code === 11000) {
      return failure(StatusCodes.CONFLICT);
    }
    throw error;
  }
}

export async function getAccounts(): Promise<Result<AccountSummary[]>> {
  const accounts = await AccountRepository.getAccounts();
  const accountSummaries = accounts.map(toAccountSummary);

  return success(accountSummaries);
}

export async function getAccountByUsername(
  username: string,
): Promise<Result<AccountSummary>> {
  const account = await AccountRepository.getAccountByUsername(username);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const accountSummary = toAccountSummary(account);

  return success(accountSummary);
}

export async function login(
  request: LoginRequest,
): Promise<Result<LoginResponse>> {
  const account = await AccountRepository.getAccountByUsername(
    request.username,
  );

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const passwordMatch = await bcrypt.compare(
    request.password,
    account.password,
  );

  if (!passwordMatch) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const nowInSeconds = Date.now() / 1000;

  const payload = {
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
    sub: account._id,
    exp: nowInSeconds + env.JWT_EXPIRATION_TIME_IN_SECONDS,
    iat: nowInSeconds,
    username: account.username,
  };

  const token = jwt.sign(payload, env.JWT_SECRET);

  return success({ jwt: token });
}

function toAccountSummary(account: Account): AccountSummary {
  const { _id, ...rest } = account;
  return { id: _id!, ...rest };
}
