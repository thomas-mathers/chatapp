import jwt, { JwtPayload } from 'jsonwebtoken';

import config from '../config';
import Account from '../models/account';

export function createJwtForAccount(account: Account): string {
  const nowInSeconds = Date.now() / 1000;

  const payload = {
    iss: config.jwt.issuer,
    aud: config.jwt.audience,
    sub: account._id,
    exp: nowInSeconds + config.jwt.maxAgeInSeconds,
    iat: nowInSeconds,
    username: account.username,
  };

  return jwt.sign(payload, config.jwt.secret);
}

export function verifyJwt(token: string): JwtPayload {
  const options = {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
    maxAge: config.jwt.maxAgeInSeconds,
  };

  const payload = jwt.verify(token, config.jwt.secret, options);

  return payload as JwtPayload;
}
