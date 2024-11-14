import {
  ChangePasswordRequest,
  ConfirmEmailRequest,
  ExchangeAuthCodeRequest,
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetTokenRequest,
} from 'chatapp.account-service-contracts';

import { HttpClient } from './http-client';

export class AuthServiceClient {
  constructor(private readonly httpClient: HttpClient) {}

  async login(body: LoginRequest): Promise<LoginResponse> {
    const result = await this.httpClient.postJson<LoginResponse>({
      path: '/auth/login',
      body,
    });

    return result;
  }

  async exchangeAuthCodeForToken(
    body: ExchangeAuthCodeRequest,
  ): Promise<LoginResponse> {
    const result = await this.httpClient.postJson<LoginResponse>({
      path: '/auth/auth-codes',
      body,
    });

    return result;
  }

  async changePassword(
    body: ChangePasswordRequest,
    token: string,
  ): Promise<void> {
    await this.httpClient.putJson({
      path: '/auth/me/password',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });
  }

  async forgotPassword(body: PasswordResetTokenRequest): Promise<void> {
    await this.httpClient.postJson({
      path: '/auth/password-reset-requests',
      body,
    });
  }

  async resetPassword(body: PasswordResetRequest): Promise<void> {
    await this.httpClient.postJson({
      path: '/auth/password-resets',
      body,
    });
  }

  async confirmEmail(body: ConfirmEmailRequest): Promise<void> {
    await this.httpClient.postJson({
      path: `/auth/email-confirmations`,
      body,
    });
  }
}
