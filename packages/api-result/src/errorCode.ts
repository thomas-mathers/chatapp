export enum ErrorCode {
  UsernameOrEmailAlreadyExists = 'UsernameOrEmailAlreadyExists',
  AccountNotFound = 'AccountNotFound',
  EmailNotVerified = 'EmailNotVerified',
  IncorrectPassword = 'IncorrectPassword',
  InvalidToken = 'InvalidToken',
  InvalidRequest = 'InvalidRequest',
}

export const ErrorCodeMessages: Record<ErrorCode, string> = {
  [ErrorCode.UsernameOrEmailAlreadyExists]: 'Username or email already exists',
  [ErrorCode.AccountNotFound]: 'Account not found',
  [ErrorCode.EmailNotVerified]: 'Email not verified',
  [ErrorCode.IncorrectPassword]: 'Incorrect password',
  [ErrorCode.InvalidToken]: 'Invalid token',
  [ErrorCode.InvalidRequest]: 'Invalid request',
};
