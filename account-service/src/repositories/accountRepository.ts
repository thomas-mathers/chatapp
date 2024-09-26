import Account from '../models/account';

export default class AccountRepository {
  private accounts: Account[];

  constructor(accounts: Account[] = []) {
    this.accounts = accounts;
  }

  createAccount(account: Account): Account {
    this.accounts.push(account);
    return account;
  }

  containsAccount(id: string): boolean {
    return this.accounts.some((account) => account.id === id);
  }

  getAccountById(id: string): Account | undefined {
    return this.accounts.find((account) => account.id === id);
  }

  getAccounts(): Account[] {
    return this.accounts;
  }
}
