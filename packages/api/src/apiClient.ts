import { ApiError } from './apiError';

interface RequestParameters {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
  body?: unknown;
}

export class ApiClient {
  constructor(private baseUrl: string) {}

  public async requestJson<T>({
    method,
    headers,
    path,
    queryParameters,
    body,
  }: RequestParameters): Promise<T> {
    let response: Response;

    const url = new URL(path, this.baseUrl);

    if (queryParameters) {
      Object.entries(queryParameters).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      response = await fetch(url.toString(), {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
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
      throw new ApiError(response.statusText, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const responseBody = await response.json();

    return responseBody as T;
  }
}
