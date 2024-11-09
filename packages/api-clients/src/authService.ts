import {
  ChangePasswordRequest,
  ConfirmEmailRequest,
  ExchangeAuthCodeRequest,
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetTokenRequest,
} from 'chatapp.account-service-contracts';

import { ApiClient } from './apiClient';
import { JwtService } from './jwtService';

export class AuthService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly jwtService: JwtService,
  ) {}

  async login(body: LoginRequest): Promise<LoginResponse> {
    const result = await this.apiClient.requestJson<
      LoginRequest,
      LoginResponse
    >({
      method: 'POST',
      path: '/auth/login',
      body,
    });

    this.jwtService.set(result.accessToken);

    return result;
  }

  async exchangeAuthCodeForToken(
    body: ExchangeAuthCodeRequest,
  ): Promise<LoginResponse> {
    const result = await this.apiClient.requestJson<
      ExchangeAuthCodeRequest,
      LoginResponse
    >({
      method: 'POST',
      path: '/auth/auth-codes',
      body,
    });

    this.jwtService.set(result.accessToken);

    return result;
  }

  async logout(): Promise<void> {
    this.jwtService.remove();
  }

  async changePassword(body: ChangePasswordRequest): Promise<void> {
    await this.apiClient.requestJson<ChangePasswordRequest, void>({
      method: 'PUT',
      path: '/auth/me/password',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
      body,
    });
  }

  async forgotPassword(body: PasswordResetTokenRequest): Promise<void> {
    await this.apiClient.requestJson<PasswordResetTokenRequest, void>({
      method: 'POST',
      path: '/auth/password-reset-requests',
      body,
    });
  }

  async resetPassword(body: PasswordResetRequest): Promise<void> {
    await this.apiClient.requestJson<PasswordResetRequest, void>({
      method: 'POST',
      path: '/auth/password-resets',
      body,
    });
  }

  async confirmEmail(body: ConfirmEmailRequest): Promise<void> {
    await this.apiClient.requestJson<ConfirmEmailRequest, void>({
      method: 'POST',
      path: `/auth/email-confirmations`,
      body,
    });
  }
}
