import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware to prevent caching (important for dynamic values)
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// Serve environment variables as JavaScript at /env.js
app.get('/env.js', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        window.ENV = {
            BACKEND_URL: '${process.env.BACKEND_URL || 'http://localhost:8080'}'
        };
    `);
});

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve the React app entry point for all other routes
app.get('/*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Set the port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
