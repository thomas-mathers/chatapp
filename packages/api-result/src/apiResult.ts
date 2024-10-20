import { StatusCodes } from 'http-status-codes';

import { ErrorCode, ErrorCodeMessages } from './errorCode';

export interface ApiResultSuccess<T> {
  status: 'success';
  statusCode: StatusCodes;
  data?: T;
  dateTime: Date;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
}

export interface ApiResultError {
  status: 'error';
  statusCode: StatusCodes;
  error: ApiError;
  dateTime: Date;
}

export type ApiResult<T> = ApiResultSuccess<T> | ApiResultError;

export function ok<T>(data?: T): ApiResultSuccess<T> {
  return {
    status: 'success',
    statusCode: StatusCodes.OK,
    data,
    dateTime: new Date(),
  };
}

export function created<T>(data?: T): ApiResultSuccess<T> {
  return {
    status: 'success',
    statusCode: StatusCodes.CREATED,
    data,
    dateTime: new Date(),
  };
}

export function badRequest(code: ErrorCode): ApiResultError {
  return {
    status: 'error',
    statusCode: StatusCodes.BAD_REQUEST,
    error: {
      code,
      message: ErrorCodeMessages[code],
    },
    dateTime: new Date(),
  };
}

export function unauthorized(code: ErrorCode): ApiResultError {
  return {
    status: 'error',
    statusCode: StatusCodes.UNAUTHORIZED,
    error: {
      code,
      message: ErrorCodeMessages[code],
    },
    dateTime: new Date(),
  };
}

export function forbidden(code: ErrorCode): ApiResultError {
  return {
    status: 'error',
    statusCode: StatusCodes.FORBIDDEN,
    error: {
      code,
      message: ErrorCodeMessages[code],
    },
    dateTime: new Date(),
  };
}

export function notFound(code: ErrorCode): ApiResultError {
  return {
    status: 'error',
    statusCode: StatusCodes.NOT_FOUND,
    error: {
      code,
      message: ErrorCodeMessages[code],
    },
    dateTime: new Date(),
  };
}

export function conflict<T>(error: ErrorCode): ApiResult<T> {
  return {
    status: 'error',
    statusCode: StatusCodes.CONFLICT,
    error: {
      code: error,
      message: ErrorCodeMessages[error],
    },
    dateTime: new Date(),
  };
}
