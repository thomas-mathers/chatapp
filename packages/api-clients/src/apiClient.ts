import { ApiError, ApiErrorCode } from 'chatapp.api-error';

interface RequestParameters {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
  body?: unknown;
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly onInvalidToken?: () => void,
  ) {}

  public async requestJson<T>({
    method,
    headers,
    path,
    queryParameters,
    body,
  }: RequestParameters): Promise<T> {
    const url = new URL(path, this.baseUrl);

    if (queryParameters) {
      Object.entries(queryParameters).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    const responseBody = await response.json();

    if (!response.ok) {
      const error = responseBody as ApiError;
      if (error.code === ApiErrorCode.InvalidToken) {
        this.onInvalidToken?.();
      }
      throw responseBody;
    }

    return responseBody as T;
  }
}
