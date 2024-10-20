import {
  AccountSummary,
  CreateAccountRequest,
} from 'chatapp.account-service-contracts';

import { ApiClient } from './apiClient';
import { JwtService } from './jwtService';

export class AccountService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount(body: CreateAccountRequest): Promise<AccountSummary> {
    const result = await this.apiClient.requestJson<AccountSummary>({
      method: 'POST',
      path: '/accounts',
      body,
    });

    if (result.status === 'error') {
      throw result.error;
    }

    return result.data!;
  }

  async getAccount(): Promise<AccountSummary> {
    const result = await this.apiClient.requestJson<AccountSummary>({
      method: 'GET',
      path: '/accounts/me',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
    });

    if (result.status === 'error') {
      throw result.error;
    }

    return result.data!;
  }

  async deleteAccount(): Promise<void> {
    const result = await this.apiClient.requestJson<void>({
      method: 'DELETE',
      path: '/accounts/me',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
    });

    if (result.status === 'error') {
      throw result.error;
    }
  }
}
