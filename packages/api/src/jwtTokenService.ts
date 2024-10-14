export class JwtTokenService {
  getJwtToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  setJwtToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }
}
