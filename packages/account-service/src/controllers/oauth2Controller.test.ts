import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';
import nock from 'nock';
import request from 'supertest';
import { describe, it } from 'vitest';

import { Account } from '../models/account';
import { ExternalAccount } from '../models/externalAccount';

const GOOGLE_AUTH_CODE =
  '4/_QCXwy-PG5Ub_JTiL7ULaCVb6K-Jsv45c7TPqPsG2-sCPYMTseEtqHWcU_ynqWQJB3Vuw5Ad1etoWqNPBaGvGHY';
const GOOGLE_LOGIN_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_EXCHANGE_BASE_URL = 'https://www.googleapis.com/oauth2/v4';
const GOOGLE_USER_INFO_BASE_URL = 'https://www.googleapis.com/oauth2/v3';

const FACEBOOK_AUTH_CODE = 'AQDZ';
const FACEBOOK_LOGIN_URL = 'https://www.facebook.com/v3.2/dialog/';
const FACEBOOK_TOKEN_EXCHANGE_BASE_URL =
  'https://graph.facebook.com/v3.2/oauth';
const FACEBOOK_USER_INFO_BASE_URL = 'https://graph.facebook.com/v3.2';

const FRONT_END_URL = 'http://localhost:5173';

const userAccessToken = faker.internet.jwt();
const idToken = faker.internet.jwt();
const expiresIn = 3599;
const tokenType = 'Bearer';
const scope = 'openid email profile';
const sub = faker.internet.username();
const email = faker.internet.email();
const name = faker.person.fullName();

describe('OAuth2Controller', () => {
  describe('GET /oauth2/google/login', () => {
    it('should redirect to google login page', async ({ app }) => {
      const response = await request(app.httpServer)
        .get('/oauth2/google/login')
        .expect(302);

      expect(response.headers.location).toContain(GOOGLE_LOGIN_URL);
    });
  });

  describe('GET /oauth2/google/callback', () => {
    beforeEach(() => {
      nock(GOOGLE_TOKEN_EXCHANGE_BASE_URL)
        .post('/token', (body) => {
          return body.code === GOOGLE_AUTH_CODE;
        })
        .reply(200, {
          access_token: userAccessToken,
          id_token: idToken,
          expires_in: expiresIn,
          token_type: tokenType,
          scope,
        });

      nock(GOOGLE_USER_INFO_BASE_URL)
        .get(`/userinfo?access_token=${userAccessToken}`)
        .reply(200, {
          sub,
          email,
          name,
        });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should handle existing user signing in for the second time', async ({
      app,
    }) => {
      await app.mongoDatabase.collection<Account>('accounts').insertOne({
        _id: new ObjectId('69581b3bd9016fddded6f047'),
        email,
        username: email,
        emailVerified: true,
        password: faker.internet.password(),
        dateCreated: new Date(),
      });

      await app.mongoDatabase
        .collection<ExternalAccount>('externalAccounts')
        .insertOne({
          accountId: new ObjectId('69581b3bd9016fddded6f047'),
          provider: 'google',
          providerAccountId: sub,
          dateCreated: new Date(),
        });

      const response = await request(app.httpServer)
        .get(`/oauth2/google/callback?code=${GOOGLE_AUTH_CODE}`)
        .expect(302);

      expect(response.headers.location).toContain(
        `${FRONT_END_URL}?code=${GOOGLE_AUTH_CODE}`,
      );
    });

    it('should handle existing user signing in for the first time', async ({
      app,
    }) => {
      await app.mongoDatabase.collection<Account>('accounts').insertOne({
        email,
        username: email,
        emailVerified: true,
        password: faker.internet.password(),
        dateCreated: new Date(),
      });

      const response = await request(app.httpServer)
        .get(`/oauth2/google/callback?code=${GOOGLE_AUTH_CODE}`)
        .expect(302);

      expect(response.headers.location).toContain(
        `${FRONT_END_URL}?code=${GOOGLE_AUTH_CODE}`,
      );
    });

    it('should handle new user', async ({ app }) => {
      const response = await request(app.httpServer)
        .get(`/oauth2/google/callback?code=${GOOGLE_AUTH_CODE}`)
        .expect(302);

      expect(response.headers.location).toContain(
        `${FRONT_END_URL}?code=${GOOGLE_AUTH_CODE}`,
      );
    });
  });

  describe('GET /oauth2/facebook/login', () => {
    it('should redirect to facebook login page', async ({ app }) => {
      const response = await request(app.httpServer)
        .get('/oauth2/facebook/login')
        .expect(302);

      expect(response.headers.location).toContain(FACEBOOK_LOGIN_URL);
    });
  });

  describe('GET /oauth2/facebook/callback', () => {
    beforeEach(() => {
      nock(FACEBOOK_TOKEN_EXCHANGE_BASE_URL)
        .post('/access_token', (body) => {
          return body.code === FACEBOOK_AUTH_CODE;
        })
        .reply(200, {
          access_token: userAccessToken,
          id_token: idToken,
          expires_in: expiresIn,
          token_type: tokenType,
          scope,
        });

      nock(FACEBOOK_USER_INFO_BASE_URL)
        .get(
          `/me?fields=id%2Cemail%2Clast_name%2Cfirst_name%2Cmiddle_name%2Cpicture&access_token=${userAccessToken}`,
        )
        .reply(200, {
          sub,
          email,
          name,
        });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should handle existing user signing in for the second time', async ({
      app,
    }) => {
      await app.mongoDatabase.collection<Account>('accounts').insertOne({
        _id: new ObjectId('69581b3bd9016fddded6f047'),
        email,
        username: email,
        emailVerified: true,
        password: faker.internet.password(),
        dateCreated: new Date(),
      });

      await app.mongoDatabase
        .collection<ExternalAccount>('externalAccounts')
        .insertOne({
          accountId: new ObjectId('69581b3bd9016fddded6f047'),
          provider: 'facebook',
          providerAccountId: sub,
          dateCreated: new Date(),
        });

      const response = await request(app.httpServer)
        .get(`/oauth2/facebook/callback?code=${FACEBOOK_AUTH_CODE}`)
        .expect(302);

      expect(response.headers.location).toContain(
        `${FRONT_END_URL}?code=${FACEBOOK_AUTH_CODE}`,
      );
    });

    it('should handle existing user signing in for the first time', async ({
      app,
    }) => {
      await app.mongoDatabase.collection<Account>('accounts').insertOne({
        email,
        username: email,
        emailVerified: true,
        password: faker.internet.password(),
        dateCreated: new Date(),
      });

      const response = await request(app.httpServer)
        .get(`/oauth2/facebook/callback?code=${FACEBOOK_AUTH_CODE}`)
        .expect(302);

      expect(response.headers.location).toContain(
        `${FRONT_END_URL}?code=${FACEBOOK_AUTH_CODE}`,
      );
    });

    it('should handle new user', async ({ app }) => {
      const response = await request(app.httpServer)
        .get(`/oauth2/facebook/callback?code=${FACEBOOK_AUTH_CODE}`)
        .expect(302);

      expect(response.headers.location).toContain(
        `${FRONT_END_URL}?code=${FACEBOOK_AUTH_CODE}`,
      );
    });
  });
});
