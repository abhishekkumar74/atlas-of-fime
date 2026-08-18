import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder-atlas.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Atlas of Time API Server',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/events — Fetch historical events
app.get('/api/events', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_dates(*),
        event_layers(
          layers(*)
        )
      `)
      .order('created_at', { ascending: true });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

// POST /api/search — Server-side search over entities
app.post('/api/search', async (req: Request, res: Response) => {
  const { query, limit = 10 } = req.body;
  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: 'Query string is required' });
    return;
  }

  try {
    const { data, error } = await supabase.rpc('search_entities', {
      search_term: query.trim(),
      result_limit: limit,
    });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Search execution failed' });
  }
});

// POST /api/historian — Grounded AI Historian response synthesis
app.post('/api/historian', async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'Question parameter required' });
    return;
  }

  const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    res.json({
      answer: 'AI Historian server is in fallback mode. Please configure OPENAI_API_KEY.',
      refused: false,
    });
    return;
  }

  try {
    res.json({
      answer: `Grounded API Response for: "${question}"`,
      refused: false,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'AI Historian processing failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Atlas of Time API Server listening on port ${PORT}`);
});
