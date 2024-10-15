import request from 'supertest';
import express from 'express';
import urlRoutes from '../routes/urlRoutes';
import axios from 'axios';

// Mock the PostgreSQL Pool class
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Mock axios
jest.mock('axios');

const { Pool } = require('pg');
const mockPool = new Pool();

const app = express();
app.use(express.json());
app.use('/', urlRoutes);

describe('URL Shortener Routes', () => {
    beforeEach(() => {
      mockPool.query.mockReset();
      (axios.get as jest.Mock).mockReset();
    });
    describe('POST /shorten', () => {
        it('should return an existing shortened URL if the URL already exists', async () => {
        // Mocking the database query to return an existing slug
        mockPool.query.mockResolvedValueOnce({ rows: [{ slug: 'abc123' }] });

        const response = await request(app)
            .post('/shorten')
            .set('Host', 'localhost:3000')
            .send({ url: 'https://www.example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ shortenedUrl: 'http://localhost:3000/abc123' });
        });

        it('should generate a new shortened URL if the URL does not exist', async () => {
        // Mocking the database query to simulate no existing URL and a successful insert
        mockPool.query
            .mockResolvedValueOnce({ rows: [] }) // No existing URL found
            .mockResolvedValueOnce({}); // Successful insertion

        // Mocking axios to return a new slug from slug-service
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: { slug: 'newSlug' } });

        const response = await request(app)
            .post('/shorten')
            .set('Host', 'localhost:3000')
            .send({ url: 'https://www.newurl.com' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ shortenedUrl: 'http://localhost:3000/newSlug' });
        });
    });

    describe('GET /stats', () => {
        it('should return statistics for all shortened URLs', async () => {
        // Mocking the database query result for stats retrieval
        mockPool.query.mockResolvedValueOnce({
            rows: [
            { slug: 'abc123', original_url: 'https://www.example.com', visit_count: 10 },
            { slug: 'xyz456', original_url: 'https://www.google.com', visit_count: 20 },
            ],
        });

        const response = await request(app).get('/stats');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            { slug: 'abc123', original_url: 'https://www.example.com', visit_count: 10 },
            { slug: 'xyz456', original_url: 'https://www.google.com', visit_count: 20 },
        ]);
        });
    });

    describe('GET /:slug', () => {
        it('should redirect to the original URL and increment the visit count', async () => {
        // Mocking the database query to find the original URL and increment the visit count
        mockPool.query
            .mockResolvedValueOnce({
            rows: [{ original_url: 'https://www.example.com', visit_count: 5 }],
            }) // Find the original URL
            .mockResolvedValueOnce({}); // Successful increment of visit count

        const response = await request(app).get('/abc123');

        expect(response.status).toBe(302);
        expect(response.header.location).toBe('https://www.example.com');
        });

        it('should return a 404 if the slug does not exist', async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).get('/nonexistentSlug');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'URL not found' });
        });
    });

    describe('GET /download/csv', () => {
        it('should return a CSV file with statistics for shortened URLs', async () => {
            // Mocking the database query result for stats retrieval
            mockPool.query.mockResolvedValueOnce({
                rows: [
                    { slug: 'abc123', original_url: 'https://www.example.com', visit_count: 10, created_at: '2023-01-01T12:00:00Z' },
                    { slug: 'xyz456', original_url: 'https://www.google.com', visit_count: 20, created_at: '2023-02-01T12:00:00Z' },
                ],
            });
    
            const response = await request(app).get('/download/csv');
    
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('text/csv');
            expect(response.headers['content-disposition']).toBe('attachment;filename=shortened_urls.csv');
    
            // Verify the CSV content
            const expectedCsv = [
                'Slug,Original URL,Visit Count,Created At',
                'abc123,https://www.example.com,10,2023-01-01T12:00:00.000Z',
                'xyz456,https://www.google.com,20,2023-02-01T12:00:00.000Z',
            ].join('\n');
    
            expect(response.text.trim()).toEqual(expectedCsv);
        });
    
        it('should return a 404 if there is no data available', async () => {
            // Mocking the database query to return no rows
            mockPool.query.mockResolvedValueOnce({
                rows: [],
            });
    
            const response = await request(app).get('/download/csv');
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'No data available' });
        });
    });
    
});
