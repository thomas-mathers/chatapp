export interface JwtOptions {
  issuer: string;
  audience: string;
  expirationTimeInSeconds: number;
  secret: string;
}
