import { LoginResponse } from 'chatapp.account-service-contracts';
import { HttpResponse, http } from 'msw';

export const authHandlers = [
  http.post('/auth/login', () => {
    const loginResponse: LoginResponse = {
      accessToken:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MzI0NzU0MjQsImV4cCI6MTc2NDAxMTQyNCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.qJ2Cix37wyQSh6PpCnERe-2kAYUli4d6vLNh2zTw1PQ',
    };
    return HttpResponse.json(loginResponse, { status: 200 });
  }),

  http.post('/auth/auth-codes', () => {
    const loginResponse: LoginResponse = {
      accessToken:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MzI0NzU0MjQsImV4cCI6MTc2NDAxMTQyNCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.qJ2Cix37wyQSh6PpCnERe-2kAYUli4d6vLNh2zTw1PQ',
    };
    return HttpResponse.json(loginResponse, { status: 200 });
  }),

  http.put('/auth/me/password', () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  http.post('/auth/password-reset-requests', () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  http.post('/auth/password-resets', () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  http.post('/auth/email-confirmations', () => {
    return HttpResponse.json({}, { status: 200 });
  }),
];
