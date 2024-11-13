import { AccountSummary } from 'chatapp.account-service-contracts';

import { Account } from '../models/account';

export function toAccountSummary(account: Account): AccountSummary {
  const { _id, username, email, profilePictureUrl, dateCreated } = account;
  return {
    id: _id!.toString(),
    username,
    email,
    profilePictureUrl,
    dateCreated: dateCreated.toISOString(),
  };
}
