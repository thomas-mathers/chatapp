import { faker } from '@faker-js/faker';
import { AccountRegistrationRequest } from 'chatapp.account-service-contracts';
import { createHashSync } from 'chatapp.crypto';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { beforeEach, describe, it } from 'vitest';

import { toAccountSummary } from '../mappers/toAccountSummary';
import { Account } from '../models/account';

const myUsername = faker.internet.userName();
const myPassword = faker.internet.password();
const myEmail = faker.internet.email();

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
    username: faker.internet.userName(),
    password: createHashSync(faker.internet.password()),
    email: faker.internet.email(),
    emailVerified: true,
    dateCreated: new Date('2024-01-02T00:00:00.000Z'),
  },
  {
    _id: new ObjectId(),
    username: faker.internet.userName(),
    password: createHashSync(faker.internet.password()),
    email: faker.internet.email(),
    emailVerified: true,
    dateCreated: new Date('2024-01-03T00:00:00.000Z'),
  },
  {
    _id: new ObjectId(),
    username: faker.internet.userName(),
    password: createHashSync(faker.internet.password()),
    email: faker.internet.email(),
    emailVerified: true,
    dateCreated: new Date('2024-01-04T00:00:00.000Z'),
  },
];

describe('AccountController', () => {
  beforeEach(async ({ app }) => {
    const accountCollection = app.mongoDatabase.collection<Account>('accounts');
    await accountCollection.insertMany(accounts);
  });

  describe('POST /accounts', () => {
    it('should create a new account and return 201', async ({ app }) => {
      const newAccount: Partial<AccountRegistrationRequest> = {
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
      const newAccount: Partial<AccountRegistrationRequest> = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const response = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(response.status).toBe(400);
    });

    it('should return 400 when email is missing', async ({ app }) => {
      const newAccount: Partial<AccountRegistrationRequest> = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };

      const response = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(response.status).toBe(400);
    });

    it('should return 400 when password is missing', async ({ app }) => {
      const newAccount: Partial<AccountRegistrationRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
      };

      const response = await request(app.httpServer)
        .post('/accounts')
        .send(newAccount);

      expect(response.status).toBe(400);
    });

    it('should return 409 when username is already taken', async ({ app }) => {
      const existingAccount: Partial<AccountRegistrationRequest> = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
      };

      const createResponse = await request(app.httpServer)
        .post('/accounts')
        .send(existingAccount);

      expect(createResponse.status).toBe(201);

      const conflictingAccount: Partial<AccountRegistrationRequest> = {
        username: existingAccount.username,
        password: faker.internet.password(),
        email: faker.internet.email(),
      };

      const conflictResponse = await request(app.httpServer)
        .post('/accounts')
        .send(conflictingAccount);

      expect(conflictResponse.status).toBe(409);
    });

    it('should return 409 when email is already taken', async ({ app }) => {
      const existingAccount: Partial<AccountRegistrationRequest> = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const createdResponse = await request(app.httpServer)
        .post('/accounts')
        .send(existingAccount);

      expect(createdResponse.status).toBe(201);

      const conflictingAccount: Partial<AccountRegistrationRequest> = {
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

  describe('GET /accounts', () => {
    it('should return 401 when no token is provided', async ({ app }) => {
      const response = await request(app.httpServer).get('/accounts');

      expect(response.status).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async ({
      app,
    }) => {
      const response = await request(app.httpServer)
        .get('/accounts')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return 200 when a valid token is provided', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: accounts
          .toSorted((a, b) => a.username.localeCompare(b.username))
          .map(toAccountSummary),
        page: 1,
        pageSize: 10,
        totalRecords: accounts.length,
        totalPages: 1,
      });
    });

    it('should return 200 when a valid token is provided with accountIds', async ({
      app,
    }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ accountIds: accounts[0]._id?.toHexString() })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: [toAccountSummary(accounts[0])],
        page: 1,
        pageSize: 10,
        totalRecords: 1,
        totalPages: 1,
      });
    });

    it('should sort by username in ascending order', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ sortBy: 'username', sortDirection: 'asc' })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: accounts
          .toSorted((a, b) => a.username.localeCompare(b.username))
          .map(toAccountSummary),
        page: 1,
        pageSize: 10,
        totalRecords: accounts.length,
        totalPages: 1,
      });
    });

    it('should sort by username in descending order', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ sortBy: 'username', sortDirection: 'desc' })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: accounts
          .toSorted((a, b) => a.username.localeCompare(b.username))
          .reverse()
          .map(toAccountSummary),
        page: 1,
        pageSize: 10,
        totalRecords: accounts.length,
        totalPages: 1,
      });
    });

    it('should sort by email in ascending order', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ sortBy: 'email', sortDirection: 'asc' })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: accounts
          .toSorted((a, b) => a.email.localeCompare(b.email))
          .map(toAccountSummary),
        page: 1,
        pageSize: 10,
        totalRecords: accounts.length,
        totalPages: 1,
      });
    });

    it('should sort by email in descending order', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ sortBy: 'email', sortDirection: 'desc' })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: accounts
          .toSorted((a, b) => a.email.localeCompare(b.email))
          .reverse()
          .map(toAccountSummary),
        page: 1,
        pageSize: 10,
        totalRecords: accounts.length,
        totalPages: 1,
      });
    });

    it('should sort by dateCreated in ascending order', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ sortBy: 'dateCreated', sortDirection: 'asc' })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: accounts
          .toSorted((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime())
          .map(toAccountSummary),
        page: 1,
        pageSize: 10,
        totalRecords: accounts.length,
        totalPages: 1,
      });
    });

    it('should sort by dateCreated in descending order', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ sortBy: 'dateCreated', sortDirection: 'desc' })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: accounts
          .toSorted((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime())
          .reverse()
          .map(toAccountSummary),
        page: 1,
        pageSize: 10,
        totalRecords: accounts.length,
        totalPages: 1,
      });
    });

    it('should return the first page of accounts', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ page: 1, pageSize: 2 })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: accounts
          .toSorted((a, b) => a.username.localeCompare(b.username))
          .slice(0, 2)
          .map(toAccountSummary),
        page: 1,
        pageSize: 2,
        totalRecords: 4,
        totalPages: 2,
      });
    });

    it('should return the second page of accounts', async ({ app }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ page: 2, pageSize: 2 })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: accounts
          .toSorted((a, b) => a.username.localeCompare(b.username))
          .slice(2, 4)
          .map(toAccountSummary),
        page: 2,
        pageSize: 2,
        totalRecords: 4,
        totalPages: 2,
      });
    });

    it('should return an empty list when page is out of bounds', async ({
      app,
    }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ page: 3, pageSize: 2 })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: [],
        page: 3,
        pageSize: 2,
        totalRecords: 4,
        totalPages: 2,
      });
    });

    it('should return all the accounts when the page size is larger than the total number of accounts', async ({
      app,
    }) => {
      const authResponse = await request(app.httpServer)
        .post('/auth/login')
        .send({
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts')
        .query({ page: 1, pageSize: 10 })
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        records: accounts
          .toSorted((a, b) => a.username.localeCompare(b.username))
          .map(toAccountSummary),
        page: 1,
        pageSize: 10,
        totalRecords: 4,
        totalPages: 1,
      });
    });
  });

  describe('GET /accounts/me', () => {
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
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .get('/accounts/me')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(myUsername);
      expect(response.body.email).toBe(myEmail);
    });
  });

  describe('DELETE /accounts/me', () => {
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
          username: myUsername,
          password: myPassword,
        });

      expect(authResponse.status).toBe(200);

      const response = await request(app.httpServer)
        .delete('/accounts/me')
        .set('Authorization', `Bearer ${authResponse.body.jwt}`);

      expect(response.status).toBe(200);
    });
  });
});
