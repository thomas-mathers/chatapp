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
    const { code, result } = await this.apiClient.requestJson<LoginResponse>({
      method: 'POST',
      path: '/auth/login',
      body,
    });

    if (code === 401 || code === 404) {
      throw new Error('Invalid username/password');
    }

    this.jwtService.set(result.jwt);

    return result;
  }

  async logout(): Promise<void> {
    this.jwtService.remove();
  }

  async changePassword(body: ChangePasswordRequest): Promise<void> {
    const { code, result } = await this.apiClient.requestJson<void>({
      method: 'PUT',
      path: '/auth/me/password',
      headers: {
        Authorization: `Bearer ${this.jwtService.get()}`,
      },
      body,
    });

    if (code === 401) {
      throw new Error('Unauthorized');
    }

    if (code === 404) {
      throw new Error('Account not found');
    }

    return result;
  }

  async forgotPassword(body: PasswordResetTokenRequest): Promise<void> {
    const { code, result } = await this.apiClient.requestJson<void>({
      method: 'POST',
      path: '/auth/password-reset-requests',
      body,
    });

    if (code === 404) {
      throw new Error('Account not found');
    }

    return result;
  }

  async resetPassword(body: PasswordResetRequest): Promise<void> {
    const { code, result } = await this.apiClient.requestJson<void>({
      method: 'POST',
      path: '/auth/password-resets',
      body,
    });

    if (code === 401) {
      throw new Error('Unauthorized');
    }

    if (code === 404) {
      throw new Error('Account not found');
    }

    return result;
  }

  async confirmEmail(body: ConfirmEmailRequest): Promise<void> {
    const { code, result } = await this.apiClient.requestJson<void>({
      method: 'POST',
      path: `/auth/email-confirmations`,
      body,
    });

    if (code === 401) {
      throw new Error('Unauthorized');
    }

    if (code === 404) {
      throw new Error('Account not found');
    }

    return result;
  }
}
