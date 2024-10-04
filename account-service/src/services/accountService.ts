import {
  AccountSummary,
  CreateAccountRequest,
} from 'chatapp.account-service-contracts';
import { createHash } from 'chatapp.crypto';
import { StatusCodes } from 'http-status-codes';
import { MongoError } from 'mongodb';

import Account from '../models/account';
import * as AccountRepository from '../repositories/accountRepository';
import { Result, failure, success } from '../statusCodeResult';

export async function createAccount(
  request: CreateAccountRequest,
): Promise<Result<AccountSummary>> {
  try {
    const hash = await createHash(request.password);

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

export async function getAccountById(
  id: string,
): Promise<Result<AccountSummary>> {
  const account = await AccountRepository.getAccountById(id);

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

function toAccountSummary(account: Account): AccountSummary {
  const { _id, username, email, createdAt } = account;
  return {
    id: _id!.toString(),
    username,
    email,
    createdAt,
  };
}
