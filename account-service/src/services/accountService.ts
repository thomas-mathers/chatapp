import { StatusCodes } from 'http-status-codes';

import { failure, Result, success } from '../statusCodeResult';

import AccountRepository from '../repositories/accountRepository';
import CreateAccountRequest from '../requests/createAccountRequest';
import Account from '../models/account';
import AccountSummary from '../responses/accountSummary';

export default class AccountService {
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  createAccount(request: CreateAccountRequest): Result<Account> {
    return this.accountRepository.containsAccount(request.id)
      ? failure(StatusCodes.CONFLICT)
      : success(
          this.accountRepository.createAccount(
            new Account(request.id, request.password),
          ),
          201,
        );
  }

  getAccountById(id: string): Result<Account> {
    const account = this.accountRepository.getAccountById(id);
    return account === undefined
      ? failure(StatusCodes.NOT_FOUND)
      : success(account);
  }

  getAccounts(): Result<AccountSummary[]> {
    const accounts = this.accountRepository.getAccounts();
    return success(
      accounts.map((account) => ({
        id: account.id,
        dateCreated: account.dateCreated,
      })),
    );
  }
}
