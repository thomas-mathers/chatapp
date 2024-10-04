import {
  GetAccountsRequest,
  Page,
  SortDirection,
} from 'chatapp.account-service-contracts';
import { ObjectId, Sort } from 'mongodb';

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

export async function getAccounts({
  page = 0,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDirection = SortDirection.Asc,
}: GetAccountsRequest): Promise<Page<Account>> {
  const totalRecords = await accountCollection.countDocuments();

  const skip = page * pageSize;
  const limit = pageSize;
  const sort: Sort = {
    [sortBy]: sortDirection === SortDirection.Asc ? 1 : -1,
  };

  const records = await accountCollection
    .find({}, { skip, limit, sort })
    .toArray();

  return {
    records,
    totalRecords,
    page,
    pageSize,
    totalPages: Math.ceil(totalRecords / pageSize),
  };
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
