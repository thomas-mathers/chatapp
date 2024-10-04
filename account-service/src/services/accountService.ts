import {
  AccountSummary,
  ChangePasswordRequest,
  CreateAccountRequest,
  GetAccountsRequest,
  LoginRequest,
  LoginResponse,
  Page,
} from 'chatapp.account-service-contracts';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { MongoError } from 'mongodb';

import config from '../config';
import Account from '../models/account';
import * as AccountRepository from '../repositories/accountRepository';
import { Result, failure, success } from '../statusCodeResult';
import { hashPassword, verifyPassword } from '../util/cryptoUtil';

export async function createAccount(
  request: CreateAccountRequest,
): Promise<Result<AccountSummary>> {
  try {
    const hash = await hashPassword(request.password);

    const account = await AccountRepository.createAccount({
      username: request.username,
      password: hash,
      email: request.email,
      emailVerified: false,
      createdAt: new Date(),
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

export async function getAccounts(
  req: GetAccountsRequest,
): Promise<Page<AccountSummary>> {
  const page = await AccountRepository.getAccounts(req);

  const pageSummary: Page<AccountSummary> = {
    ...page,
    records: page.records.map(toAccountSummary),
  };

  return pageSummary;
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

export async function deleteAccount(id: string): Promise<Result<void>> {
  const numDeleted = await AccountRepository.deleteAccountById(id);
  if (numDeleted === 0) {
    return failure(StatusCodes.NOT_FOUND);
  }
  return success();
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

  const passwordMatch = await verifyPassword(
    request.password,
    account.password,
  );

  if (!passwordMatch) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const nowInSeconds = Date.now() / 1000;

  const payload = {
    iss: config.jwt.issuer,
    aud: config.jwt.audience,
    sub: account._id,
    exp: nowInSeconds + config.jwt.maxAgeInSeconds,
    iat: nowInSeconds,
    username: account.username,
  };

  const token = jwt.sign(payload, config.jwt.secret);

  return success({ jwt: token });
}

export async function changePassword(
  id: string,
  { oldPassword, newPassword }: ChangePasswordRequest,
): Promise<Result<void>> {
  const account = await AccountRepository.getAccountById(id);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const passwordMatch = await verifyPassword(oldPassword, account.password);

  if (!passwordMatch) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const hash = await hashPassword(newPassword);

  await AccountRepository.updateAccount({ ...account, password: hash });

  return success();
}

function toAccountSummary(account: Account): AccountSummary {
  const { _id, username, email, createdAt } = account;
  return {
    id: _id!.toString(),
    username,
    email,
    createdAt,
  };
}
