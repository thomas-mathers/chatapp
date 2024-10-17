import { JwtService } from 'chatapp.api';

export class LocalStorageJwtService implements JwtService {
  get(): string | null {
    return localStorage.getItem('jwt');
  }

  set(token: string): void {
    localStorage.setItem('jwt', token);
  }

  remove(): void {
    localStorage.removeItem('jwt');
  }
}
