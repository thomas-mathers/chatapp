import { faker } from '@faker-js/faker';
import { CreateAccountRequest } from 'chatapp.account-service-contracts';
import request from 'supertest';
import { beforeEach, describe, it } from 'vitest';

import { Account } from '../models/account';

const username = faker.internet.userName();
const password = faker.internet.password();
const email = faker.internet.email();

describe('AuthController', () => {
  describe('POST /auth/login', () => {
    it('should return 400 when username is missing', async ({ app }) => {
      const response = await request(app.httpServer).post('/auth/login').send({
        password,
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when password is missing', async ({ app }) => {
      const response = await request(app.httpServer).post('/auth/login').send({
        username,
      });

      expect(response.status).toBe(400);
    });

    it('should return 404 when username is not found', async ({ app }) => {
      const response = await request(app.httpServer).post('/auth/login').send({
        username: faker.internet.userName(),
        password,
      });

      expect(response.status).toBe(404);
    });

    it('should return 401 when password is incorrect', async ({ app }) => {
      await request(app.httpServer).post('/accounts').send({
        username,
        password,
        email,
      });

      const response = await request(app.httpServer).post('/auth/login').send({
        username,
        password: faker.internet.password(),
      });

      expect(response.status).toBe(401);
    });

    it('should return 401 when email is not verified', async ({ app }) => {
      await request(app.httpServer).post('/accounts').send({
        username,
        password,
        email,
      });

      const response = await request(app.httpServer).post('/auth/login').send({
        username,
        password,
      });

      expect(response.status).toBe(401);
    });

    it('should return 200 when username and password are correct', async ({
      app,
    }) => {
      await request(app.httpServer).post('/accounts').send({
        username,
        password,
        email,
      });

      const accounts = app.mongoDatabase.collection<Account>('accounts');
      await accounts.updateOne({ username }, { $set: { emailVerified: true } });

      const response = await request(app.httpServer).post('/auth/login').send({
        username,
        password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jwt');
    });
  });

  describe('PUT /auth/me/password', () => {
    beforeEach(async ({ app }) => {
      await request(app.httpServer).post('/accounts').send({
        username,
        password,
        email,
      });

      const accounts = app.mongoDatabase.collection<Account>('accounts');
      await accounts.updateOne({ username }, { $set: { emailVerified: true } });
    });

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
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username,
          password,
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
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username,
          password,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`)
        .send({
          oldPassword: password,
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 when old password is incorrect', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username,
          password,
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
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username,
          password,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`)
        .send({
          oldPassword: password,
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
