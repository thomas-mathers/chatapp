export class JwtService {
  getJwt(): string | null {
    return localStorage.getItem('jwt');
  }

  setJwt(token: string): void {
    localStorage.setItem('jwt', token);
  }
}
