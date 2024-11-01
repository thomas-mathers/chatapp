import { FederatedCredentials } from '../models/federatedCredentials';
import { FederatedCredentialsSummary } from '../models/federatedCredentialsSummary';

export function toFederatedCredentialsSummary(
  federatedCredentials: FederatedCredentials,
): FederatedCredentialsSummary {
  const { _id, accountId, provider, providerAccountId, dateCreated } =
    federatedCredentials;
  return {
    id: _id!.toString(),
    accountId: accountId!.toString(),
    provider,
    providerAccountId,
    dateCreated,
  };
}
