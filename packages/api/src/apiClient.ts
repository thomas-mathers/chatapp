import { ApiError } from './apiError';
import { JwtService } from './jwtService';

export class ApiClient {
  constructor(
    private baseUrl: string,
    private jwtTokenService: JwtService,
  ) {}

  async getJsonAuthorized<T>(path: string): Promise<T> {
    const jwt = this.getJwtToken();

    return await this.getJson<T>(path, {
      Authorization: `Bearer ${jwt}`,
    });
  }

  async getJson<T>(
    path: string,
    additionalHeaders: Record<string, string> = {},
  ): Promise<T> {
    return await this.request<T>('GET', path, additionalHeaders);
  }

  async postJsonAuthorized<T>(path: string, data: unknown): Promise<T> {
    const jwt = this.getJwtToken();

    return await this.postJson<T>(path, data, {
      Authorization: `Bearer ${jwt}`,
    });
  }

  async postJson<T>(
    path: string,
    data: unknown,
    additionalHeaders: Record<string, string> = {},
  ): Promise<T> {
    return await this.request<T>('POST', path, additionalHeaders, data);
  }

  async putJsonAuthorized<T>(path: string, data: unknown): Promise<T> {
    const jwt = this.getJwtToken();

    return await this.putJson<T>(path, data, {
      Authorization: `Bearer ${jwt}`,
    });
  }

  async putJson<T>(
    path: string,
    data: unknown,
    additionalHeaders: Record<string, string> = {},
  ): Promise<T> {
    return await this.request<T>('PUT', path, additionalHeaders, data);
  }

  async deleteJsonAuthorized<T>(path: string): Promise<T> {
    const jwt = this.getJwtToken();

    return await this.deleteJson<T>(path, {
      Authorization: `Bearer ${jwt}`,
    });
  }

  async deleteJson<T>(
    path: string,
    additionalHeaders: Record<string, string> = {},
  ): Promise<T> {
    return await this.request<T>('DELETE', path, additionalHeaders);
  }

  setJwt(jwt: string): void {
    this.jwtTokenService.setJwt(jwt);
  }

  private async request<T>(
    method: string,
    path: string,
    additionalHeaders: Record<string, string> = {},
    body: unknown = undefined,
  ): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...additionalHeaders,
        },
      });
    } catch (error) {
      const isError = error instanceof Error;

      if (!isError) {
        throw new ApiError('Unknown error', undefined, error);
      }

      if (error.name === 'AbortError') {
        throw new ApiError('Request was aborted', undefined, error);
      }

      throw new ApiError('Failed to connect to the server', undefined, error);
    }

    if (!response.ok) {
      throw new ApiError(response.statusText);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const responseBody = await response.json();

    return responseBody as T;
  }

  private getJwtToken(): string {
    const jwt = this.jwtTokenService.getJwt();

    if (!jwt) {
      throw new ApiError('No JWT token found');
    }

    return jwt;
  }
}
