import { StatusCodes } from 'http-status-codes';

export interface ResultCode<T> {
  code: number;
  result: T extends void ? undefined : T;
}

export function ok<T>(): ResultCode<T> {
  return {
    code: StatusCodes.OK,
    result: undefined as T extends void ? undefined : T,
  };
}

export function okResult<T>(data: T): ResultCode<T> {
  return {
    code: StatusCodes.OK,
    result: data as T extends void ? undefined : T,
  };
}

export function created<T>(data: T): ResultCode<T> {
  return {
    code: StatusCodes.CREATED,
    result: data as T extends void ? undefined : T,
  };
}

export function badRequest<T>(): ResultCode<T> {
  return {
    code: StatusCodes.BAD_REQUEST,
    result: undefined as T extends void ? undefined : T,
  };
}

export function unauthorized<T>(): ResultCode<T> {
  return {
    code: StatusCodes.UNAUTHORIZED,
    result: undefined as T extends void ? undefined : T,
  };
}

export function forbidden<T>(): ResultCode<T> {
  return {
    code: StatusCodes.FORBIDDEN,
    result: undefined as T extends void ? undefined : T,
  };
}

export function notFound<T>(): ResultCode<T> {
  return {
    code: StatusCodes.NOT_FOUND,
    result: undefined as T extends void ? undefined : T,
  };
}

export function conflict<T>(): ResultCode<T> {
  return {
    code: StatusCodes.CONFLICT,
    result: undefined as T extends void ? undefined : T,
  };
}

export function resultCode<T>(code: number): ResultCode<T> {
  return { code, result: undefined as T extends void ? undefined : T };
}
