import { Pool } from 'pg';
import { stringify } from 'csv-stringify';
import { Response } from 'express';

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export const downloadCsv = async (res: Response, startDate?: string, endDate?: string) => {
    let query = 'SELECT slug, original_url, visit_count, created_at FROM urls';
    const params: any[] = [];

    if (startDate && endDate) {
        query += ' WHERE created_at BETWEEN $1 AND $2';
        params.push(startDate, endDate);
    }

    try {
        const result = await pool.query(query, params);
        const rows = result.rows;

        // If no rows, return 404
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No data available' });
        }

        // Format each row
        result.rows.forEach(row => {
            row.original_url = `${row.original_url}`.replace(/"/g, '""');
            row.created_at = new Date(row.created_at).toISOString(); 
        });

        // Define the headers for the CSV
        const columns = {
            slug: 'Slug',
            original_url: 'Original URL',
            visit_count: 'Visit Count',
            created_at: 'Created At',
          };
          

        // Stream the CSV data to the response
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment;filename=shortened_urls.csv');

        // Use csv-stringify to generate CSV data
        stringify(rows, {
            header: true,
            columns: columns,
        }).pipe(res);

    } catch (error) {
        console.error('Error during CSV download:', error);
        res.status(500).json({ error: 'Database error' });
    }
};
