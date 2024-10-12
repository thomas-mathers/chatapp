import { faker } from '@faker-js/faker';
import { CreateAccountRequest } from 'chatapp.account-service-contracts';
import request from 'supertest';
import { describe, it } from 'vitest';

describe('AuthController', () => {
  describe('PUT /auth/me/password', () => {
    it('should return 401 when no token is provided', async ({ app }) => {
      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .send({
          oldPassword: faker.internet.password(),
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async ({
      app,
    }) => {
      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', 'Bearer invalidtoken')
        .send({
          oldPassword: faker.internet.password(),
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 when old password is missing', async ({ app }) => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(createdResponse.status).toBe(201);

      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: newAccount.username,
          password: newAccount.password,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`)
        .send({
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when new password is missing', async ({ app }) => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(createdResponse.status).toBe(201);

      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: newAccount.username,
          password: newAccount.password,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`)
        .send({
          oldPassword: newAccount.password,
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 when old password is incorrect', async ({ app }) => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(createdResponse.status).toBe(201);

      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: newAccount.username,
          password: newAccount.password,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`)
        .send({
          oldPassword: faker.internet.password(),
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(401);
    });

    it('should return 200 when old password is correct', async ({ app }) => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(createdResponse.status).toBe(201);

      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: newAccount.username,
          password: newAccount.password,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`)
        .send({
          oldPassword: newAccount.password,
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /auth/password-reset-requests', () => {
    it('should return 400 when email is missing', async ({ app }) => {
      const response = await request(app.httpServer).post(
        '/auth/password-reset-requests',
      );

      expect(response.status).toBe(400);
    });

    it('should return 404 when email is not found', async ({ app }) => {
      const response = await request(app.httpServer)
        .post('/auth/password-reset-requests')
        .send({ email: faker.internet.email() });

      expect(response.status).toBe(404);
    });

    it('should return 200 when email is found', async ({ app }) => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(createdResponse.status).toBe(201);

      const response = await request(app.httpServer)
        .post('/auth/password-reset-requests')
        .send({ email: newAccount.email });

      expect(response.status).toBe(200);
    });
  });
});
