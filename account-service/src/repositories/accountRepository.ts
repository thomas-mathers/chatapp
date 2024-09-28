import Account from '../models/account';

const accounts: Account[] = [];

export function createAccount(account: Account): Account {
  accounts.push(account);
  return account;
}

export function containsAccount(id: string): boolean {
  return accounts.some((account) => account.id === id);
}

export function getAccountById(id: string): Account | undefined {
  return accounts.find((account) => account.id === id);
}

export function getAccounts(): Account[] {
  return accounts;
}
