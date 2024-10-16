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

  async createAccount(request: CreateAccountRequest): Promise<AccountSummary> {
    return this.apiClient.postJson<AccountSummary>('/accounts', request);
  }

  async getAccount(): Promise<AccountSummary> {
    return this.apiClient.getJson<AccountSummary>('/accounts/me', {
      Authorization: `Bearer ${this.jwtService.getJwt()}`,
    });
  }

  async deleteAccount(): Promise<void> {
    return this.apiClient.deleteJson<void>('/accounts/me', {
      Authorization: `Bearer ${this.jwtService.getJwt()}`,
    });
  }
}
