import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder-atlas.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Atlas of Time Vercel API Server',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/events', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
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

export default app;
