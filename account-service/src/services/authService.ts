import { LoginResponse } from 'chatapp.account-service-contracts';
import { StatusCodes } from 'http-status-codes';

import {
  getAccountByEmail,
  getAccountById,
  getAccountByUsername,
  updateAccount,
} from '../repositories/accountRepository';
import { Result, failure, success } from '../statusCodeResult';
import { hashPassword, verifyPassword } from './cryptoService';
import { createJwtForAccount, verifyJwt } from './jwtService';

export async function login(
  username: string,
  password: string,
): Promise<Result<LoginResponse>> {
  const account = await getAccountByUsername(username);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const isPasswordCorrect = await verifyPassword(password, account.password);

  if (!isPasswordCorrect) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const jwt = createJwtForAccount(account);

  return success({ jwt });
}

export async function changePassword(
  id: string,
  oldPassword: string,
  newPassword: string,
): Promise<Result<void>> {
  const account = await getAccountById(id);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const isOldPasswordCorrect = await verifyPassword(
    oldPassword,
    account.password,
  );

  if (!isOldPasswordCorrect) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const password = await hashPassword(newPassword);

  await updateAccount({ ...account, password });

  return success();
}

export async function generatePasswordResetToken(
  email: string,
): Promise<Result<string>> {
  const account = await getAccountByEmail(email);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const token = createJwtForAccount(account);

  return success(token);
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<Result<void>> {
  const { sub, username } = verifyJwt(token);

  if (sub === undefined || username === undefined) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const account = await getAccountById(sub);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const password = await hashPassword(newPassword);

  await updateAccount({ ...account, password });

  return success();
}
