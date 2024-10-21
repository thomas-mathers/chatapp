import {
  ChangePasswordRequest,
  ConfirmEmailRequest,
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
    const result = await this.apiClient.requestJson<LoginResponse>({
      method: 'POST',
      path: '/auth/login',
      body,
    });

    if (result.status === 'error') {
      throw result.error;
    }

    this.jwtService.set(result.data!.jwt);

    return result.data!;
  }

  async logout(): Promise<void> {
    this.jwtService.remove();
  }

  async changePassword(body: ChangePasswordRequest): Promise<void> {
    const result = await this.apiClient.requestJson<void>({
      method: 'PUT',
      path: '/auth/me/password',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
      body,
    });

    if (result.status === 'error') {
      throw result.error;
    }
  }

  async forgotPassword(body: PasswordResetTokenRequest): Promise<void> {
    const result = await this.apiClient.requestJson<void>({
      method: 'POST',
      path: '/auth/password-reset-requests',
      body,
    });

    if (result.status === 'error') {
      throw result.error;
    }
  }

  async resetPassword(body: PasswordResetRequest): Promise<void> {
    const result = await this.apiClient.requestJson<void>({
      method: 'POST',
      path: '/auth/password-resets',
      body,
    });

    if (result.status === 'error') {
      throw result.error;
    }
  }

  async confirmEmail(body: ConfirmEmailRequest): Promise<void> {
    const result = await this.apiClient.requestJson<void>({
      method: 'POST',
      path: `/auth/email-confirmations`,
      body,
    });

    if (result.status === 'error') {
      throw result.error;
    }
  }
}
