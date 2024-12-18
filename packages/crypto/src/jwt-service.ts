import { sign, verify } from 'jsonwebtoken';

import { JwtOptions } from './jwt-options';
import { UserCredentials } from './user-credentials';

export function createJwt(
  credential: UserCredentials,
  options: JwtOptions,
): string {
  const {
    issuer,
    audience,
    expirationTimeInSeconds: maxAgeInSeconds,
    secret,
  } = options;
  const nowInSeconds = Date.now() / 1000;

  const payload = {
    iss: issuer,
    aud: audience,
    sub: credential.userId,
    exp: nowInSeconds + maxAgeInSeconds,
    iat: nowInSeconds,
    username: credential.username,
  };

  return sign(payload, secret);
}

export function verifyJwt(
  token: string,
  options: JwtOptions,
): UserCredentials | undefined {
  try {
    const {
      issuer,
      audience,
      expirationTimeInSeconds: maxAge,
      secret,
    } = options;

    const payload = verify(token, secret, { issuer, audience, maxAge }) as {
      sub: string | undefined;
      username: string | undefined;
    };

    if (payload.sub === undefined || payload.username === undefined) {
      return undefined;
    }

    return {
      userId: payload.sub,
      username: payload.username,
    };
  } catch {
    return undefined;
  }
}
