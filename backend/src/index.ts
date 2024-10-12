import express from 'express';
import cors from 'cors';
import urlRoutes from './routes/urlRoutes';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', urlRoutes);

// Basic Routes
app.get('/', (req, res) => {
  res.send('Welcome to the URL Shortener');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});