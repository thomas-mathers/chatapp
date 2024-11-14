import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { toMessageSummary } from '../mappers/to-message-summary';
import { Message } from '../models/message';

const messages: Message[] = [
  {
    _id: new ObjectId(),
    accountId: faker.string.uuid(),
    username: faker.internet.username(),
    profilePictureUrl: faker.internet.url(),
    content: faker.lorem.sentence(),
    dateCreated: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    _id: new ObjectId(),
    accountId: faker.string.uuid(),
    username: faker.internet.username(),
    profilePictureUrl: faker.internet.url(),
    content: faker.lorem.sentence(),
    dateCreated: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    _id: new ObjectId(),
    accountId: faker.string.uuid(),
    username: faker.internet.username(),
    profilePictureUrl: faker.internet.url(),
    content: faker.lorem.sentence(),
    dateCreated: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    _id: new ObjectId(),
    accountId: faker.string.uuid(),
    username: faker.internet.username(),
    profilePictureUrl: faker.internet.url(),
    content: faker.lorem.sentence(),
    dateCreated: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    _id: new ObjectId(),
    accountId: faker.string.uuid(),
    username: faker.internet.username(),
    profilePictureUrl: faker.internet.url(),
    content: faker.lorem.sentence(),
    dateCreated: new Date('2024-01-01T00:00:00.000Z'),
  },
];

function compareByAccountId(a: Message, b: Message): number {
  return a.accountId.localeCompare(b.accountId);
}

function compareByAccountUsername(a: Message, b: Message): number {
  return a.username.localeCompare(b.username);
}

function compareByContent(a: Message, b: Message): number {
  return a.content.localeCompare(b.content);
}

function compareByDateCreated(a: Message, b: Message): number {
  return a.dateCreated.getTime() - b.dateCreated.getTime();
}

describe('MessageController', () => {
  describe('GET /messages', () => {
    it('should return 401 when no token is provided', async ({ app }) => {
      const response = await request(app.httpServer).get('/messages');
      expect(response.status).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async ({
      app,
    }) => {
      const response = await request(app.httpServer)
        .get('/messages')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return 200 when a valid token is provided', async ({
      app,
      token,
    }) => {
      const response = await request(app.httpServer)
        .get('/messages')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it.for([[-1], [0], [1.5], [1001], [''], ['abc']])(
      'should return 400 when page size is %s',
      async (pageSize, { app, token }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ pageSize });

        expect(response.status).toBe(400);
      },
    );

    it.for([[-1], [0], [1.5], [''], ['abc']])(
      'should return 400 when page is %s',
      async (page, { app, token }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ page });

        expect(response.status).toBe(400);
      },
    );

    it.for([[-1], [0], [1.5], [''], ['abc']])(
      'should return 400 when sortBy is %s',
      async (sortBy, { app, token }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortBy });

        expect(response.status).toBe(400);
      },
    );

    it.for([[-1], [0], [1.5], [''], ['abc']])(
      'should return 400 when sortDirection is %s',
      async (sortDirection, { app, token }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortDirection });

        expect(response.status).toBe(400);
      },
    );

    it('should return an empty list when there are no messages', async ({
      app,
      token,
    }) => {
      const response = await request(app.httpServer)
        .get('/messages')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        records: [],
        page: 1,
        pageSize: 10,
        totalRecords: 0,
        totalPages: 0,
      });
    });

    describe('with messages', () => {
      beforeEach(async ({ app }) => {
        const messageCollection =
          app.mongoDatabase.collection<Message>('messages');

        await messageCollection.insertMany(messages);
      });

      it('should sort by accountId in ascending order', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortBy: 'accountId' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages.toSorted(compareByAccountId).map(toMessageSummary),
          page: 1,
          pageSize: 10,
          totalRecords: messages.length,
          totalPages: 1,
        });
      });

      it('should sort by accountId in descending order', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortBy: 'accountId', sortDirection: 'desc' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages
            .toSorted(compareByAccountId)
            .reverse()
            .map(toMessageSummary),
          page: 1,
          pageSize: 10,
          totalRecords: messages.length,
          totalPages: 1,
        });
      });

      it('should sort by username in ascending order', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortBy: 'username' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages
            .toSorted(compareByAccountUsername)
            .map(toMessageSummary),
          page: 1,
          pageSize: 10,
          totalRecords: messages.length,
          totalPages: 1,
        });
      });

      it('should sort by username in descending order', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortBy: 'username', sortDirection: 'desc' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages
            .toSorted(compareByAccountUsername)
            .reverse()
            .map(toMessageSummary),
          page: 1,
          pageSize: 10,
          totalRecords: messages.length,
          totalPages: 1,
        });
      });

      it('should sort by content in ascending order', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortBy: 'content' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages.toSorted(compareByContent).map(toMessageSummary),
          page: 1,
          pageSize: 10,
          totalRecords: messages.length,
          totalPages: 1,
        });
      });

      it('should sort by content in descending order', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortBy: 'content', sortDirection: 'desc' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages
            .toSorted(compareByContent)
            .reverse()
            .map(toMessageSummary),
          page: 1,
          pageSize: 10,
          totalRecords: messages.length,
          totalPages: 1,
        });
      });

      it('should sort by dateCreated in ascending order by default', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages
            .toSorted(compareByDateCreated)
            .map(toMessageSummary),
          page: 1,
          pageSize: 10,
          totalRecords: messages.length,
          totalPages: 1,
        });
      });

      it('should sort by dateCreated in descending order', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortDirection: 'desc' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages
            .toSorted(compareByDateCreated)
            .reverse()
            .map(toMessageSummary),
          page: 1,
          pageSize: 10,
          totalRecords: messages.length,
          totalPages: 1,
        });
      });

      it('should return the first page of messages', async ({ app, token }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ page: 1, pageSize: 3 });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages
            .toSorted(compareByDateCreated)
            .slice(0, 3)
            .map(toMessageSummary),
          page: 1,
          pageSize: 3,
          totalRecords: messages.length,
          totalPages: 2,
        });
      });

      it('should return the second page of messages', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ page: 2, pageSize: 3 });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages
            .toSorted(compareByDateCreated)
            .slice(3, 5)
            .map(toMessageSummary),
          page: 2,
          pageSize: 3,
          totalRecords: messages.length,
          totalPages: 2,
        });
      });

      it('should return an empty list when the page is out of bounds', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ page: 3, pageSize: 3 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          records: [],
          page: 3,
          pageSize: 3,
          totalRecords: messages.length,
          totalPages: 2,
        });
      });

      it('should return all messages when the page size is larger than the total number of messages', async ({
        app,
        token,
      }) => {
        const response = await request(app.httpServer)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ pageSize: 10 });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          records: messages
            .toSorted(compareByDateCreated)
            .map(toMessageSummary),
          page: 1,
          pageSize: 10,
          totalRecords: messages.length,
          totalPages: 1,
        });
      });
    });
  });
});
