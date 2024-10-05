import { ObjectId } from 'mongodb';

import { getAccountsCollection } from '../databaseClient';
import { Account } from '../models/account';

const accountCollection = getAccountsCollection();

export async function createAccount(account: Account): Promise<Account> {
  await accountCollection.insertOne(account);
  return account;
}

export async function containsAccount(username: string): Promise<boolean> {
  const document = getAccountByUsername(username);
  return document !== null;
}

export async function getAccountById(id: string): Promise<Account | null> {
  return await accountCollection.findOne({ _id: new ObjectId(id) });
}

export async function getAccountByUsername(
  username: string,
): Promise<Account | null> {
  return await accountCollection.findOne({ username });
}

export async function getAccountByEmail(
  email: string,
): Promise<Account | null> {
  return await accountCollection.findOne({ email });
}

export async function updateAccount(replacement: Account): Promise<Account> {
  const { username } = replacement;
  await accountCollection.replaceOne({ username }, replacement);
  return replacement;
}

export async function deleteAccountById(id: string): Promise<number> {
  const { deletedCount } = await accountCollection.deleteOne(
    { _id: new ObjectId(id) },
    {},
  );
  return deletedCount;
}
