import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import { generateSlug } from './utils/slugGenerator';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

app.use(cors());
app.use(express.json());

// Slug generation endpoint
app.get('/generate-slug', (async (req: Request, res: Response) => {
  let slug;
  let isUnique = false;
  try {
    // Generate new slugs until we find one that is unique
    while (!isUnique) {
      slug = generateSlug(6);

      // Check if the slug already exists in the database
      const result = await pool.query('SELECT slug FROM urls WHERE slug = $1', [slug]);
      if (result.rows.length === 0) {
        isUnique = true;
      }
    }

    res.json({ slug });
  } catch (error) {
    console.error('Error during slug generation:', error);
    res.status(500).json({ error: 'Database error during slug generation' });
  }
}) as RequestHandler);

// Export the app for testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Slug generation service running on http://localhost:${PORT}`);
  });
}

export default app;
