import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRouter from './routes/auth.js';
import recipesRouter from './routes/recipes.js';
import batchesRouter from './routes/batches.js';
import logsRouter from './routes/logs.js';
import f2VariantsRouter from './routes/f2-variants.js';
import starterLogRouter from './routes/starter-log.js';
import botanicalsRouter from './routes/botanicals.js';
import statisticsRouter from './routes/statistics.js';
import exportRouter from './routes/export.js';
import { authMiddleware } from './auth.js';
import { runMigrations } from './migrate.js';
import type { AppEnv } from './types.js';

const app = new Hono<AppEnv>();

app.use('/api/*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));

// Public auth endpoints (login/register handle their own access control).
app.route('/api/auth', authRouter);

// Everything registered after this point requires a valid session.
app.use('/api/*', authMiddleware);

app.route('/api/recipes', recipesRouter);
app.route('/api/batches', batchesRouter);
app.route('/api/batches', logsRouter);
app.route('/api/f2-variants', f2VariantsRouter);
app.route('/api/starter-log', starterLogRouter);
app.route('/api/botanical-infusions', botanicalsRouter);
app.route('/api/statistics', statisticsRouter);
app.route('/api/export', exportRouter);

const port = parseInt(process.env.PORT ?? '3000');

async function start() {
  await runMigrations();
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
