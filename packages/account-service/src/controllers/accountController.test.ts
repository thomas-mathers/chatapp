import { faker } from '@faker-js/faker';
import { CreateAccountRequest } from 'chatapp.account-service-contracts';
import { Express } from 'express';
import request from 'supertest';

import { launchApp } from '../app';

describe('AccountController', () => {
  let app: Express;

  beforeAll(async () => {
    app = await launchApp();
  });

  describe('POST /accounts', () => {
    it('should create a new account and return 201', async () => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const response = await request(app).post('/accounts').send(newAccount);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(newAccount.username);
      expect(response.body.email).toBe(newAccount.email);
    });

    it('should return 400 when username is missing', async () => {
      const newAccount: Partial<CreateAccountRequest> = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const response = await request(app).post('/accounts').send(newAccount);

      expect(response.status).toBe(400);
    });

    it('should return 400 when email is missing', async () => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      const response = await request(app).post('/accounts').send(newAccount);

      expect(response.status).toBe(400);
    });

    it('should return 400 when password is missing', async () => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
      };

      const response = await request(app).post('/accounts').send(newAccount);

      expect(response.status).toBe(400);
    });

    it('should return 409 when username is already taken', async () => {
      const existingAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app)
        .post('/accounts')
        .send(existingAccount);

      expect(createdResponse.status).toBe(201);

      const conflictingAccount: Partial<CreateAccountRequest> = {
        username: existingAccount.username,
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const conflictResponse = await request(app)
        .post('/accounts')
        .send(conflictingAccount);

      expect(conflictResponse.status).toBe(409);
    });

    it('should return 409 when email is already taken', async () => {
      const existingAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app)
        .post('/accounts')
        .send(existingAccount);

      expect(createdResponse.status).toBe(201);

      const conflictingAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: existingAccount.email,
        password: faker.internet.password(),
      };

      const conflictResponse = await request(app)
        .post('/accounts')
        .send(conflictingAccount);

      expect(conflictResponse.status).toBe(409);
    });
  });

  describe('GET /accounts/me', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/accounts/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async () => {
      const response = await request(app)
        .get('/accounts/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return 200 when a valid token is provided', async () => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app)
        .post('/accounts')
        .send(newAccount);

      expect(createdResponse.status).toBe(201);

      const authResponse = await request(app).post('/auth/login').send({
        username: newAccount.username,
        password: newAccount.password,
      });

      expect(authResponse.status).toBe(200);

      const response = await request(app)
        .get('/accounts/me')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(newAccount.username);
      expect(response.body.email).toBe(newAccount.email);
    });
  });

  describe('DELETE /accounts/me', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).delete('/accounts/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async () => {
      const response = await request(app)
        .delete('/accounts/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return 200 when a valid token is provided', async () => {
      const newAccount: Partial<CreateAccountRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app)
        .post('/accounts')
        .send(newAccount);

      expect(createdResponse.status).toBe(201);

      const authResponse = await request(app).post('/auth/login').send({
        username: newAccount.username,
        password: newAccount.password,
      });

      expect(authResponse.status).toBe(200);

      const response = await request(app)
        .delete('/accounts/me')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
    });
  });
});
