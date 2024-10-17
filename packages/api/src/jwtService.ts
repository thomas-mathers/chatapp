export interface JwtService {
  get(): string | null;
  set(token: string): void;
  remove(): void;
}
