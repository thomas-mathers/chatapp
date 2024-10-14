import {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetTokenRequest,
} from 'chatapp.account-service-contracts';

import { ApiClient } from './apiClient';

export class AuthService {
  constructor(private readonly apiClient: ApiClient) {}

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const response = await this.apiClient.postJson<LoginResponse>(
      '/auth/login',
      loginRequest,
    );

    this.apiClient.setJwt(response.jwt);

    return response;
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    return await this.apiClient.putJsonAuthorized<void>(
      '/auth/me/password',
      request,
    );
  }

  async forgotPassword(request: PasswordResetTokenRequest): Promise<void> {
    return await this.apiClient.postJson<void>(
      '/auth/password-reset-requests',
      request,
    );
  }

  async resetPassword(request: PasswordResetRequest): Promise<void> {
    return await this.apiClient.postJson<void>(
      '/auth/password-resets',
      request,
    );
  }
}
