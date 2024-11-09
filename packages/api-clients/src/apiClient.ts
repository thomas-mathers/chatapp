import { ApiError, ApiErrorCode } from 'chatapp.api-error';

interface RequestParameters<T> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
  body?: T;
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly onInvalidToken?: () => void,
  ) {}

  public async request<TRequest, TResponse>({
    method,
    headers,
    path,
    queryParameters,
    body,
  }: RequestParameters<TRequest>): Promise<TResponse> {
    const url = new URL(path, this.baseUrl);

    if (queryParameters) {
      Object.entries(queryParameters).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method,
      body: body ? JSON.stringify(body) : undefined,
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

  public async requestJson<TRequest, TResponse>({
    method,
    headers,
    path,
    queryParameters,
    body,
  }: RequestParameters<TRequest>): Promise<TResponse> {
    return this.request<TRequest, TResponse>({
      method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      path,
      queryParameters,
      body,
    });
  }

  public async requestFormData<TResponse>({
    headers,
    path,
    queryParameters,
    body,
  }: RequestParameters<FormData>): Promise<TResponse> {
    return this.request<FormData, TResponse>({
      method: 'POST',
      headers,
      path,
      queryParameters,
      body,
    });
  }
}
