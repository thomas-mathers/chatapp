import { getAccountsCollection } from '../databaseClient';
import Account from '../models/account';

const accountCollection = getAccountsCollection();

export async function createAccount(account: Account): Promise<Account> {
  await accountCollection.insertOne(account);
  return account;
}

export async function containsAccount(username: string): Promise<boolean> {
  const document = getAccountByUsername(username);
  return document !== null;
}

export async function getAccountByUsername(
  username: string,
): Promise<Account | null> {
  return await accountCollection.findOne({ username });
}

export async function getAccounts(): Promise<Account[]> {
  return await accountCollection.find({}).toArray();
}
