import express, { Request, Response, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import { shortenUrl } from '../services/shortenService';
import { redirectUrl } from '../services/redirectService';
import { getStats } from '../services/statsService';
import { downloadCsv } from '../services/downloadCsvService';
import url from 'url';

const router = express.Router();

// Stats Endpoint
router.get('/stats', (async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
  
    try {
      const stats = await getStats(startDate, endDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }) as RequestHandler);
  
  export default router;
  
// Shorten URL Endpoint
router.post('/shorten', body('url').isURL(), (async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { url } = req.body;

  try {
    const server = 'http://' + req.headers.host;
    const response = await shortenUrl(server, url);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
}) as RequestHandler);

// Redirect to Original URL Endpoint
router.get('/:slug', (async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const originalUrl = await redirectUrl(slug);
    res.redirect(originalUrl);
  } catch (error) {
    res.status(404).json({ error: 'URL not found' });
  }
}) as RequestHandler);

// Route to download CSV
router.get('/download/csv', (async (req: Request, res: Response) => {
  try {
      await downloadCsv(res);
  } catch (error) {
      res.status(500).json({ error: 'Error generating CSV' });
  }
}) as RequestHandler);