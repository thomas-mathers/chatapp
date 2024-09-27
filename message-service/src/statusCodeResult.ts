interface ResultSuccess<T> {
  isSuccess: true;
  statusCode: number;
  data: T;
}

interface ResultFailure {
  isSuccess: false;
  statusCode: number;
  data: undefined;
}

export type Result<TSuccess> = ResultSuccess<TSuccess> | ResultFailure;

export function success<T>(
  data: T,
  statusCode: number = 200,
): ResultSuccess<T> {
  return { isSuccess: true, statusCode, data };
}

export function failure(statusCode: number): ResultFailure {
  return { isSuccess: false, statusCode, data: undefined };
}
