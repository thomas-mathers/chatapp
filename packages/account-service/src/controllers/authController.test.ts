import { faker } from '@faker-js/faker';
import { AccountRegistrationRequest } from 'chatapp.account-service-contracts';
import { createHashSync } from 'chatapp.crypto';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { beforeEach, describe, it } from 'vitest';

import { Account } from '../models/account';

const myUsername = faker.internet.username();
const myPassword = faker.internet.password();
const myEmail = faker.internet.email();
const myUnverifiedEmailUsername = faker.internet.username();
const myUnverifiedEmailPassword = faker.internet.password();
const myUnverifiedEmail = faker.internet.email();

const accounts: Account[] = [
  {
    _id: new ObjectId(),
    username: myUsername,
    password: createHashSync(myPassword),
    email: myEmail,
    emailVerified: true,
    dateCreated: new Date('2023-01-01T00:00:00.000Z'),
  },
  {
    _id: new ObjectId(),
    username: myUnverifiedEmailUsername,
    password: createHashSync(myUnverifiedEmailPassword),
    email: myUnverifiedEmail,
    emailVerified: false,
    dateCreated: new Date('2023-01-01T00:00:00.000Z'),
  },
];

describe('AuthController', () => {
  beforeEach(async ({ app }) => {
    const accountCollection = app.mongoDatabase.collection<Account>('accounts');
    await accountCollection.insertMany(accounts);
  });

  describe('POST /auth/login', () => {
    it('should return 400 when username is missing', async ({ app }) => {
      const response = await request(app.httpServer).post('/auth/login').send({
        password: myPassword,
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when password is missing', async ({ app }) => {
      const response = await request(app.httpServer).post('/auth/login').send({
        username: myUsername,
      });

      expect(response.status).toBe(400);
    });

    it('should return 404 when username is not found', async ({ app }) => {
      const response = await request(app.httpServer).post('/auth/login').send({
        username: faker.internet.username(),
        password: myPassword,
      });

      expect(response.status).toBe(404);
    });

    it('should return 401 when password is incorrect', async ({ app }) => {
      const response = await request(app.httpServer).post('/auth/login').send({
        username: myUsername,
        password: faker.internet.password(),
      });

      expect(response.status).toBe(401);
    });

    it('should return 401 when email is not verified', async ({ app }) => {
      const response = await request(app.httpServer).post('/auth/login').send({
        username: myUnverifiedEmailUsername,
        password: myUnverifiedEmailPassword,
      });

      expect(response.status).toBe(401);
    });

    it('should return 200 when username and password are correct', async ({
      app,
    }) => {
      const response = await request(app.httpServer).post('/auth/login').send({
        username: myUsername,
        password: myPassword,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });
  });

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
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${authResponse.body.accessToken}`)
        .send({
          newPassword: faker.internet.password(),
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when new password is missing', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${authResponse.body.accessToken}`)
        .send({
          oldPassword: myPassword,
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 when old password is incorrect', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${authResponse.body.accessToken}`)
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
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .put('/auth/me/password')
        .set('Authorization', `Bearer ${authResponse.body.accessToken}`)
        .send({
          oldPassword: myPassword,
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
      const newAccount: Partial<AccountRegistrationRequest> = {
        username: faker.internet.username(),
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
