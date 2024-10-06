import { sign, verify, VerifyOptions } from "jsonwebtoken";
import { JwtOptions } from "./jwtOptions";
import { UserCredentials } from "./userCredentials";

export function createJwt(
  credential: UserCredentials,
  options: JwtOptions
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
  options: JwtOptions
): UserCredentials | undefined {
  const { issuer, audience, expirationTimeInSeconds: maxAge, secret } = options;

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
}
