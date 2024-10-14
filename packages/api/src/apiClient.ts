import { ApiError } from './apiError';
import { JwtTokenService } from './jwtTokenService';

export class ApiClient {
  constructor(
    private baseUrl: string,
    private jwtTokenService: JwtTokenService,
  ) {}

  async getJsonAuthorized<T>(path: string, signal?: AbortSignal): Promise<T> {
    const jwt = this.jwtTokenService.getJwtToken();

    if (!jwt) {
      throw new ApiError('No JWT token found');
    }

    return this.getJson<T>(
      path,
      {
        Authorization: `Bearer ${jwt}`,
      },
      signal,
    );
  }

  async getJson<T>(
    path: string,
    additionalHeaders: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        headers: additionalHeaders,
        signal,
      });
    } catch (error: unknown) {
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

    const body = await response.json();

    return body as T;
  }

  async postJsonAuthorized<T>(
    path: string,
    data: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const jwt = this.jwtTokenService.getJwtToken();

    if (!jwt) {
      throw new ApiError('No JWT token found');
    }

    return this.postJson<T>(
      path,
      data,
      {
        Authorization: `Bearer ${jwt}`,
      },
      signal,
    );
  }

  async postJson<T>(
    path: string,
    data: unknown,
    additionalHeaders: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...additionalHeaders,
        },
        body: JSON.stringify(data),
        signal,
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

    const body = await response.json();

    return body as T;
  }

  async putJsonAuthorized<T>(
    path: string,
    data: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const jwt = this.jwtTokenService.getJwtToken();

    if (!jwt) {
      throw new ApiError('No JWT token found');
    }

    return this.putJson<T>(
      path,
      data,
      {
        Authorization: `Bearer ${jwt}`,
      },
      signal,
    );
  }

  async putJson<T>(
    path: string,
    data: unknown,
    additionalHeaders: Record<string, string> = {},
    signal?: AbortSignal,
  ): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...additionalHeaders,
        },
        body: JSON.stringify(data),
        signal,
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

    const body = await response.json();

    return body as T;
  }

  async deleteJsonAuthorized<T>(path: string): Promise<T> {
    const jwt = this.jwtTokenService.getJwtToken();

    if (!jwt) {
      throw new ApiError('No JWT token found');
    }

    return this.deleteJson<T>(path, {
      Authorization: `Bearer ${jwt}`,
    });
  }

  async deleteJson<T>(
    path: string,
    additionalHeaders: Record<string, string> = {},
  ): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        ...additionalHeaders,
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

    const body = await response.json();

    return body as T;
  }
}
