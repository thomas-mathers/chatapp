import {
  AccountSummary,
  CreateAccountRequest,
} from 'chatapp.account-service-contracts';

import { ApiClient } from './apiClient';

export class AccountService {
  constructor(private readonly apiClient: ApiClient) {}

  async createAccount(request: CreateAccountRequest): Promise<AccountSummary> {
    return this.apiClient.postJson<AccountSummary>('/accounts', request);
  }

  async getAccount(): Promise<AccountSummary> {
    return this.apiClient.getJsonAuthorized<AccountSummary>('/accounts/me');
  }

  async deleteAccount(): Promise<void> {
    return this.apiClient.deleteJsonAuthorized<void>('/accounts/me');
  }
}
