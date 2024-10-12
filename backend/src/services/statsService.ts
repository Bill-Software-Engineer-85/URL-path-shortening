import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export const getStats = async (startDate?: string, endDate?: string) => {
    let query = 'SELECT slug, original_url, visit_count, created_at FROM urls';
    const params: any[] = [];

    if (startDate && endDate) {
        query += ' WHERE created_at BETWEEN $1 AND $2';
        params.push(startDate, endDate);
    }

    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Error during stats retrieval:', error);
        throw new Error('Database error');
    }
};
