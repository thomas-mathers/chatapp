import { ApiError, ApiErrorCode } from 'chatapp.api-error';

interface FetchRequest {
  path: string;
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
}

interface FetchRequestWithBody<T> extends FetchRequest {
  body?: T;
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly onInvalidToken?: () => void,
  ) {}

  public async getJson<TResponse>(request: FetchRequest): Promise<TResponse> {
    return await this.requestJson<TResponse>('GET', request);
  }

  public async postJson<TResponse>(
    request: FetchRequestWithBody<unknown>,
  ): Promise<TResponse> {
    return await this.requestJson<TResponse>('POST', request);
  }

  public async putJson<TResponse>(
    request: FetchRequestWithBody<unknown>,
  ): Promise<TResponse> {
    return await this.requestJson<TResponse>('PUT', request);
  }

  public async deleteJson<TResponse>(
    request: FetchRequestWithBody<unknown>,
  ): Promise<TResponse> {
    return await this.requestJson<TResponse>('DELETE', request);
  }

  public async postFormData<TResponse>({
    headers,
    path,
    queryParameters,
    body,
  }: FetchRequestWithBody<FormData>): Promise<TResponse> {
    return this.request<TResponse>(
      'POST',
      path,
      headers,
      queryParameters,
      body,
    );
  }

  private async requestJson<TResponse>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    { headers, path, queryParameters, body }: FetchRequestWithBody<unknown>,
  ): Promise<TResponse> {
    return this.request<TResponse>(
      method,
      path,
      {
        ...headers,
        'Content-Type': 'application/json',
      },
      queryParameters,
      body ? JSON.stringify(body) : undefined,
    );
  }

  private async request<TResponse>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    headers?: Record<string, string>,
    queryParameters?: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
  ): Promise<TResponse> {
    const url = new URL(path, this.baseUrl);

    if (queryParameters) {
      Object.entries(queryParameters).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method,
      body,
      headers,
    });

    const responseBody = await response.json();

    if (!response.ok) {
      const error = responseBody as ApiError;

      if (error.code === ApiErrorCode.InvalidToken) {
        this.onInvalidToken?.();
      }

      throw responseBody;
    }

    return responseBody as TResponse;
  }
}
