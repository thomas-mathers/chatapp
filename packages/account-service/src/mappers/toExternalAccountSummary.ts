import { ExternalAccount } from '../models/externalAccount';
import { ExternalAccountSummary } from '../models/externalAccountSummary';

export function toExternalAccountSummary(
  externalAccount: ExternalAccount,
): ExternalAccountSummary {
  const { _id, accountId, provider, providerAccountId, dateCreated } =
    externalAccount;
  return {
    id: _id!.toString(),
    accountId: accountId!.toString(),
    provider,
    providerAccountId,
    dateCreated,
  };
}
