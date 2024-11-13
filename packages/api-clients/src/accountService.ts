import {
  AccountRegistrationRequest,
  AccountSummary,
} from 'chatapp.account-service-contracts';

import { ApiClient } from './apiClient';
import { JwtService } from './jwtService';

export class AccountService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount(
    body: AccountRegistrationRequest,
  ): Promise<AccountSummary> {
    const result = await this.apiClient.postJson<AccountSummary>({
      path: '/accounts',
      body,
    });

    return result;
  }

  async getAccount(): Promise<AccountSummary> {
    const result = await this.apiClient.getJson<AccountSummary>({
      path: '/accounts/me',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
    });

    return result;
  }

  async deleteAccount(): Promise<void> {
    await this.apiClient.deleteJson({
      path: '/accounts/me',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
    });
  }
}
