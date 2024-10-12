import request from 'supertest';
import app from '../index';

// Mock the PostgreSQL Pool class
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const { Pool } = require('pg');
const mockPool = new Pool();

describe('Slug Generation Service', () => {
  beforeEach(() => {
    mockPool.query.mockReset();
  });

  describe('GET /generate-slug', () => {
    it('should generate a unique slug if no collision', async () => {
      // Mocking the database query to simulate no collision
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/generate-slug');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('slug');
      expect(response.body.slug).toHaveLength(6); // Assuming the slug length is 6
    });

    it('should retry slug generation if collision occurs', async () => {
      // Mocking the database query to simulate a collision on the first attempt
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ slug: 'abcdef' }] }) // First generated slug exists (collision)
        .mockResolvedValueOnce({ rows: [] }); // Second generated slug is unique (no collision)

      const response = await request(app).get('/generate-slug');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('slug');
      expect(response.body.slug).toHaveLength(6); // Assuming the slug length is 6
    });

    it('should handle database errors gracefully', async () => {
      // Mocking the database query to throw an error
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/generate-slug');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error during slug generation' });
    });
  });
});
