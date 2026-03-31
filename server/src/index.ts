import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import recipesRouter from './routes/recipes.js';
import batchesRouter from './routes/batches.js';
import logsRouter from './routes/logs.js';
import f2VariantsRouter from './routes/f2-variants.js';
import starterLogRouter from './routes/starter-log.js';
import botanicalsRouter from './routes/botanicals.js';
import statisticsRouter from './routes/statistics.js';
import exportRouter from './routes/export.js';

const app = new Hono();

app.use('/api/*', cors());

app.route('/api/recipes', recipesRouter);
app.route('/api/batches', batchesRouter);
app.route('/api/batches', logsRouter);
app.route('/api/f2-variants', f2VariantsRouter);
app.route('/api/starter-log', starterLogRouter);
app.route('/api/botanical-infusions', botanicalsRouter);
app.route('/api/statistics', statisticsRouter);
app.route('/api/export', exportRouter);

app.get('/health', (c) => c.json({ status: 'ok' }));

const port = parseInt(process.env.PORT ?? '3000');
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on port ${port}`);
});
