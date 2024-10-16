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

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const response = await this.apiClient.postJson<LoginResponse>(
      '/auth/login',
      loginRequest,
    );

    this.jwtService.setJwt(response.jwt);

    return response;
  }

  async logout(): Promise<void> {
    this.jwtService.clearJwt();
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    return await this.apiClient.putJson<void>('/auth/me/password', request, {
      Authorization: `Bearer ${this.jwtService.getJwt()}`,
    });
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

  async confirmEmail(request: ConfirmEmailRequest): Promise<void> {
    return await this.apiClient.postJson<void>(
      `/auth/email-confirmations`,
      request,
    );
  }
}
