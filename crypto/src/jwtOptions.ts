export interface JwtOptions {
  issuer: string;
  audience: string;
  maxAgeInSeconds: number;
  secret: string;
}
