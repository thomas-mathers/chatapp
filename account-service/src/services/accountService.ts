import { StatusCodes } from 'http-status-codes';

import { failure, Result, success } from '../statusCodeResult';

import * as AccountRepository from '../repositories/accountRepository';
import CreateAccountRequest from '../requests/createAccountRequest';
import Account from '../models/account';
import AccountSummary from '../responses/accountSummary';

export function createAccount(request: CreateAccountRequest): Result<Account> {
  return AccountRepository.containsAccount(request.id)
    ? failure(StatusCodes.CONFLICT)
    : success(
        AccountRepository.createAccount(
          new Account(request.id, request.password),
        ),
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
