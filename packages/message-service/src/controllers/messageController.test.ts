import request from 'supertest';
import { describe, it } from 'vitest';

describe('MessageController', () => {
  describe('GET /messages', () => {
    it('should return 401 when no token is provided', async ({ app }) => {
      const response = await request(app).get('/messages');
      expect(response.status).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async ({
      app,
    }) => {
      const response = await request(app)
        .get('/messages')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return 200 when a valid token is provided', async ({
      app,
      token,
    }) => {
      const response = await request(app)
        .get('/messages')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it.for([[-1], [0], [1.5], [''], ['abc']])(
      'should return 400 when page size is %s',
      async (pageSize, { app, token }) => {
        const response = await request(app)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ pageSize });

        expect(response.status).toBe(400);
      },
    );

    it.for([[-1], [0], [1.5], [''], ['abc']])(
      'should return 400 when page is %s',
      async (page, { app, token }) => {
        const response = await request(app)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ page });

        expect(response.status).toBe(400);
      },
    );

    it.for([[-1], [0], [1.5], [''], ['abc']])(
      'should return 400 when sortBy is %s',
      async (sortBy, { app, token }) => {
        const response = await request(app)
          .get('/messages')
          .set('Authorization', `Bearer ${token}`)
          .query({ sortBy });

        expect(response.status).toBe(400);
      },
    );

    it.for([[-1], [0], [1.5], [''], ['abc']])(
      'should return 400 when sortDirection is %s',
      async (sortDirection, { app, token }) => {
        const response = await request(app)
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
      const response = await request(app)
        .get('/messages')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        records: [],
        totalRecords: 0,
        page: 0,
        pageSize: 10,
        totalPages: 0,
      });
    });
  });
});
