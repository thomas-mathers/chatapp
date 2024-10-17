import { JwtService } from 'chatapp.api';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';

export class CookieJwtTokenService implements JwtService {
  get(): string | undefined {
    return Cookies.get('jwt');
  }

  set(token: string): void {
    const payload = decode(token);
    if (typeof payload === 'string') {
      throw new Error('Invalid JWT token');
    }
    Cookies.set('jwt', token, {
      sameSite: 'strict',
      secure: true,
      expires: new Date(payload.exp * 1000),
    });
  }

  remove(): void {
    Cookies.remove('jwt');
  }
}
