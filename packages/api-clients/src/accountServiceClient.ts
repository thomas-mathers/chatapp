import {
  AccountRegistrationRequest,
  AccountSummary,
} from 'chatapp.account-service-contracts';

import { HttpClient } from './httpClient';

export class AccountServiceClient {
  constructor(private readonly httpClient: HttpClient) {}

  async createAccount(
    body: AccountRegistrationRequest,
  ): Promise<AccountSummary> {
    const result = await this.httpClient.postJson<AccountSummary>({
      path: '/accounts',
      body,
    });

    return result;
  }

  async getAccountById(
    accountId: string,
    apiKey: string,
  ): Promise<AccountSummary> {
    const result = await this.httpClient.getJson<AccountSummary>({
      path: `/accounts/${accountId}`,
      headers: {
        'X-API-KEY': apiKey,
      },
    });

    return result;
  }

  async getAccount(accessToken: string): Promise<AccountSummary> {
    const result = await this.httpClient.getJson<AccountSummary>({
      path: '/accounts/me',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return result;
  }

  async deleteAccount(accessToken: string): Promise<void> {
    await this.httpClient.deleteJson({
      path: '/accounts/me',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
