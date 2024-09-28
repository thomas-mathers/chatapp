import { StatusCodes } from 'http-status-codes';

import Account from '../models/account';
import * as AccountRepository from '../repositories/accountRepository';
import CreateAccountRequest from '../requests/createAccountRequest';
import AccountSummary from '../responses/accountSummary';
import { Result, failure, success } from '../statusCodeResult';

export function createAccount(request: CreateAccountRequest): Result<Account> {
  return AccountRepository.containsAccount(request.id)
    ? failure(StatusCodes.CONFLICT)
    : success(
        AccountRepository.createAccount({
          id: request.id,
          password: request.password,
          dateCreated: new Date(),
        }),
        201,
      );
}

export function getAccountById(id: string): Result<Account> {
  const account = AccountRepository.getAccountById(id);
  return account === undefined
    ? failure(StatusCodes.NOT_FOUND)
    : success(account);
}

export function getAccounts(): Result<AccountSummary[]> {
  const accounts = AccountRepository.getAccounts();
  return success(
    accounts.map((account) => ({
      id: account.id,
      dateCreated: account.dateCreated,
    })),
  );
}
