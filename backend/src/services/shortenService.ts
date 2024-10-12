import { Pool } from 'pg';
import axios from 'axios';

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export const shortenUrl = async (server: string, url: string) => {
  try {

    // Check if URL starts with "http://" or "https://"
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `http://${formattedUrl}`;
    }

    // Check if the URL already exists in the database
    const existingResult = await pool.query('SELECT slug FROM urls WHERE original_url = $1', [formattedUrl]);
    if (existingResult.rows.length > 0) {
      // If the URL already exists, return the existing shortened URL
      return { shortenedUrl: `${server}/${existingResult.rows[0].slug}` };
    }

    // Call the slug service to generate a slug
    const slugResponse = await axios.get(`${process.env.SLUG_SERVICE_URL}/generate-slug`);
    const slug = slugResponse.data.slug;

    // Insert the new URL and slug into the database
    await pool.query('INSERT INTO urls (slug, original_url) VALUES ($1, $2)', [slug, formattedUrl]);
    return { shortenedUrl: `${server}/${slug}` };
  } catch (error) {
    console.error('Error during URL shortening:', error);
    throw new Error('Database error');
  }
};
