import { ApiError } from 'chatapp.api-error';

export enum AccountServiceErrorCode {
  AccountNotFound = 'AccountNotFound',
  EmailExists = 'EmailExists',
  EmailNotVerified = 'EmailNotVerified',
  IncorrectPassword = 'IncorrectPassword',
  InvalidAuthCode = 'InvalidAuthCode',
  InvalidToken = 'InvalidToken',
  Unknown = 'Unknown',
  UsernameExists = 'UsernameExists',
}

function getErrorCodeMessage(errorCode: AccountServiceErrorCode): string {
  switch (errorCode) {
    case AccountServiceErrorCode.AccountNotFound:
      return 'Account not found';
    case AccountServiceErrorCode.EmailExists:
      return 'Email already exists';
    case AccountServiceErrorCode.EmailNotVerified:
      return 'Email not verified';
    case AccountServiceErrorCode.IncorrectPassword:
      return 'Incorrect password';
    case AccountServiceErrorCode.InvalidAuthCode:
      return 'Invalid auth code';
    case AccountServiceErrorCode.InvalidToken:
      return 'Invalid token';
    case AccountServiceErrorCode.Unknown:
      return 'Unknown error';
    case AccountServiceErrorCode.UsernameExists:
      return 'Username already exists';
    default:
      return 'Unknown error';
  }
}

export function createAccountServiceError(
  code: AccountServiceErrorCode,
): ApiError<AccountServiceErrorCode> {
  return {
    code,
    message: getErrorCodeMessage(code),
    details: {},
  };
}
