import { StatusCodes } from 'http-status-codes';

import { ApiErrorCode } from './api-error-code';

export class ApiError extends Error {
  private readonly _statusCode: number;
  private readonly _code: ApiErrorCode;
  private readonly _message: string;
  private readonly _details: Record<string, unknown>;

  private constructor(
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super(message);

    this._statusCode = statusCode;
    this._code = code;
    this._message = message;
    this._details = details;
  }

  public static fromErrorCode({
    code,
    message,
    details,
  }: {
    code: ApiErrorCode;
    message?: string;
    details?: Record<string, unknown>;
  }): ApiError {
    return new ApiError(
      ApiError.getStatusCode(code),
      code,
      message ?? ApiError.getErrorCodeMessage(code),
      details,
    );
  }

  private static getErrorCodeMessage(errorCode: ApiErrorCode): string {
    switch (errorCode) {
      case ApiErrorCode.AccountNotFound:
        return 'Account not found';
      case ApiErrorCode.EmailExists:
        return 'Email already exists';
      case ApiErrorCode.EmailMissing:
        return 'Email missing';
      case ApiErrorCode.EmailNotVerified:
        return 'Email not verified';
      case ApiErrorCode.IncorrectPassword:
        return 'Incorrect password';
      case ApiErrorCode.InvalidAuthCode:
        return 'Invalid auth code';
      case ApiErrorCode.InvalidRequest:
        return 'Invalid request';
      case ApiErrorCode.InvalidToken:
        return 'Invalid token';
      case ApiErrorCode.Unknown:
        return 'Unknown error';
      case ApiErrorCode.UsernameExists:
        return 'Username already exists';
      default:
        return 'Unknown error';
    }
  }

  private static getStatusCode(errorCode: ApiErrorCode): number {
    switch (errorCode) {
      case ApiErrorCode.AccountNotFound:
        return StatusCodes.NOT_FOUND;
      case ApiErrorCode.EmailExists:
        return StatusCodes.CONFLICT;
      case ApiErrorCode.EmailMissing:
        return StatusCodes.BAD_REQUEST;
      case ApiErrorCode.EmailNotVerified:
        return StatusCodes.UNAUTHORIZED;
      case ApiErrorCode.IncorrectPassword:
        return StatusCodes.UNAUTHORIZED;
      case ApiErrorCode.InvalidAuthCode:
        return StatusCodes.UNAUTHORIZED;
      case ApiErrorCode.InvalidRequest:
        return StatusCodes.BAD_REQUEST;
      case ApiErrorCode.InvalidToken:
        return StatusCodes.UNAUTHORIZED;
      case ApiErrorCode.UsernameExists:
        return StatusCodes.CONFLICT;
      default:
        return StatusCodes.INTERNAL_SERVER_ERROR;
    }
  }

  public get statusCode(): number {
    return this._statusCode;
  }

  public get code(): ApiErrorCode {
    return this._code;
  }

  public get message(): string {
    return this._message;
  }

  public get details(): Record<string, unknown> {
    return this._details;
  }

  toJSON(): Record<string, unknown> {
    return {
      status: this._statusCode,
      code: this._code,
      message: this._message,
      details: this._details,
    };
  }
}
