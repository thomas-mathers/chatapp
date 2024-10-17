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
    return this.apiClient.requestJson<AccountSummary>({
      method: 'GET',
      path: '/accounts',
      body,
    });
  }

  async getAccount(): Promise<AccountSummary> {
    return this.apiClient.requestJson<AccountSummary>({
      method: 'GET',
      path: '/accounts/me',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
    });
  }

  async deleteAccount(): Promise<void> {
    return this.apiClient.requestJson<void>({
      method: 'DELETE',
      path: '/accounts/me',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
    });
  }
}
