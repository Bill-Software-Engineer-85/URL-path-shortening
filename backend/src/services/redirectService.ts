import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export const redirectUrl = async (slug: string) => {
    try {
        // Find the original URL based on the slug
        const result = await pool.query('SELECT original_url, visit_count FROM urls WHERE slug = $1', [slug]);
        if (result.rows.length === 0) {
            throw new Error('URL not found');
        }

        const originalUrl = result.rows[0].original_url;

        // Increment visit count
        await pool.query('UPDATE urls SET visit_count = visit_count + 1 WHERE slug = $1', [slug]);

        return originalUrl;
    } catch (error) {
        console.error('Error during redirection:', error);
        throw new Error('Database error');
    }
};
