import {
  ResultCode,
  ok,
  okResult,
  resultCode,
} from 'chatapp.status-code-result';

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
  }: RequestParameters): Promise<ResultCode<T>> {
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

    if (!response.ok) {
      return resultCode(response.status);
    }

    if (response.status === 204) {
      return ok();
    }

    const responseBody = await response.json();

    return okResult(responseBody as T);
  }
}
