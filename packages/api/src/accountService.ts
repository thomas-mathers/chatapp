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
    const { code, result } = await this.apiClient.requestJson<AccountSummary>({
      method: 'POST',
      path: '/accounts',
      body,
    });

    if (code === 409) {
      throw new Error('Username or email already taken');
    }

    return result;
  }

  async getAccount(): Promise<AccountSummary> {
    const { code, result } = await this.apiClient.requestJson<AccountSummary>({
      method: 'GET',
      path: '/accounts/me',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
    });

    if (code === 404) {
      throw new Error('Account not found');
    }

    return result;
  }

  async deleteAccount(): Promise<void> {
    const { code, result } = await this.apiClient.requestJson<void>({
      method: 'DELETE',
      path: '/accounts/me',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
    });

    if (code === 404) {
      throw new Error('Account not found');
    }

    return result;
  }
}
