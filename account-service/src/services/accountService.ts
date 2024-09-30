import { StatusCodes } from 'http-status-codes';
import { MongoError } from 'mongodb';

import Account from '../models/account';
import * as AccountRepository from '../repositories/accountRepository';
import CreateAccountRequest from '../requests/createAccountRequest';
import { Result, failure, success } from '../statusCodeResult';

export async function createAccount(
  request: CreateAccountRequest,
): Promise<Result<Account>> {
  try {
    const account = await AccountRepository.createAccount({
      username: request.username,
      password: request.password,
      dateCreated: new Date(),
    });
    return success(account, 201);
  } catch (error) {
    if (error instanceof MongoError && error.code === 11000) {
      return failure(StatusCodes.CONFLICT);
    }
    throw error;
  }
}

export async function getAccounts(): Promise<Result<Account[]>> {
  const accounts = await AccountRepository.getAccounts();
  return success(accounts);
}

export async function getAccountByUsername(
  username: string,
): Promise<Result<Account>> {
  const account = await AccountRepository.getAccountByUsername(username);
  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }
  return success(account);
}
