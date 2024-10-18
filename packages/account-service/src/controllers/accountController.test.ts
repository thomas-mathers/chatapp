import { faker } from '@faker-js/faker';
import { CreateAccountRequest } from 'chatapp.account-service-contracts';
import request from 'supertest';
import { beforeEach, describe, it } from 'vitest';

import { Account } from '../models/account';

const username = faker.internet.userName();
const password = faker.internet.password();
const email = faker.internet.email();

describe('AccountController', () => {
  describe('POST /accounts', () => {
    it('should create a new account and return 201', async ({ app }) => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const response = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(newAccount.username);
      expect(response.body.email).toBe(newAccount.email);
    });

    it('should return 400 when username is missing', async ({ app }) => {
      const newAccount: Partial<CreateAccountRequest> = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const response = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(response.status).toBe(400);
    });

    it('should return 400 when email is missing', async ({ app }) => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      const response = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(response.status).toBe(400);
    });

    it('should return 400 when password is missing', async ({ app }) => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
      };

      const response = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(response.status).toBe(400);
    });

    it('should return 409 when username is already taken', async ({ app }) => {
      const existingAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app.httpServer)
        .post('/accounts')
        .send(existingAccount);

      expect(createdResponse.status).toBe(201);

      const conflictingAccount: Partial<CreateAccountRequest> = {
        username: existingAccount.username,
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const conflictResponse = await request(app.httpServer)
        .post('/accounts')
        .send(conflictingAccount);

      expect(conflictResponse.status).toBe(409);
    });

    it('should return 409 when email is already taken', async ({ app }) => {
      const existingAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app.httpServer)
        .post('/accounts')
        .send(existingAccount);

      expect(createdResponse.status).toBe(201);

      const conflictingAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: existingAccount.email,
        password: faker.internet.password(),
      };

      const conflictResponse = await request(app.httpServer)
        .post('/accounts')
        .send(conflictingAccount);

      expect(conflictResponse.status).toBe(409);
    });
  });

  describe('GET /accounts/me', () => {
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
      const response = await request(app.httpServer).get('/accounts/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async ({
      app,
    }) => {
      const response = await request(app.httpServer)
        .get('/accounts/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return 200 when a valid token is provided', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username,
          password,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts/me')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(username);
      expect(response.body.email).toBe(email);
    });
  });

  describe('DELETE /accounts/me', () => {
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
      const response = await request(app.httpServer).delete('/accounts/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async ({
      app,
    }) => {
      const response = await request(app.httpServer)
        .delete('/accounts/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return 200 when a valid token is provided', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username,
          password,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .delete('/accounts/me')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
    });
  });
});
