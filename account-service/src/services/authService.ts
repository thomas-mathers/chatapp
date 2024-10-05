import {
  LoginResponse,
  PasswordResetTokenResponse,
} from 'chatapp.account-service-contracts';
import { createHash, createJwt, verifyHash, verifyJwt } from 'chatapp.crypto';
import { StatusCodes } from 'http-status-codes';

import { config } from '../config';
import { logger } from '../logger';
import {
  getAccountByEmail,
  getAccountById,
  getAccountByUsername,
  updateAccount,
} from '../repositories/accountRepository';
import { Result, failure, success } from '../statusCodeResult';

export async function login(
  username: string,
  password: string,
): Promise<Result<LoginResponse>> {
  const account = await getAccountByUsername(username);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const isPasswordCorrect = await verifyHash(password, account.password);

  if (!isPasswordCorrect) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const jwt = createJwt(
    { userId: account._id!.toString(), username: account.username },
    config.jwt,
  );

  logger.info('User logged in', {
    id: account._id,
    username: account.username,
    email: account.email,
  });

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

  const isOldPasswordCorrect = await verifyHash(oldPassword, account.password);

  if (!isOldPasswordCorrect) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const password = await createHash(newPassword);

  await updateAccount({ ...account, password });

  logger.info('User password changed', {
    id: account._id,
    username: account.username,
    email: account.email,
  });

  return success();
}

export async function generatePasswordResetToken(
  email: string,
): Promise<Result<PasswordResetTokenResponse>> {
  const account = await getAccountByEmail(email);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const token = createJwt(
    { userId: account._id!.toString(), username: account.username },
    config.jwt,
  );

  logger.info('Password reset token generated', {
    id: account._id,
    username: account.username,
    email: account.email,
  });

  return success({ token });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<Result<void>> {
  const userCredentials = verifyJwt(token, config.jwt);

  if (userCredentials === undefined) {
    return failure(StatusCodes.UNAUTHORIZED);
  }

  const account = await getAccountById(userCredentials.userId);

  if (!account) {
    return failure(StatusCodes.NOT_FOUND);
  }

  const password = await createHash(newPassword);

  await updateAccount({ ...account, password });

  logger.info('User password reset', {
    id: account._id,
    username: account.username,
    email: account.email,
  });

  return success();
}
