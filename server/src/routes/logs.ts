import { Hono } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db.js';
import { fermentationLogEntries } from '../schema.js';

const router = new Hono();

const toNum = (v: string | null | undefined) =>
  v !== null && v !== undefined ? parseFloat(v) : null;

function mapLog(r: typeof fermentationLogEntries.$inferSelect) {
  return {
    ...r,
    ph: toNum(r.ph),
    brix: toNum(r.brix),
    temperature_c: toNum(r.temperature_c),
    timestamp: r.timestamp.toISOString(),
    created_at: r.created_at.toISOString(),
  };
}

router.get('/:batchId/logs', async (c) => {
  const rows = await db.select().from(fermentationLogEntries)
    .where(eq(fermentationLogEntries.batch_id, c.req.param('batchId')))
    .orderBy(desc(fermentationLogEntries.timestamp));
  return c.json(rows.map(mapLog));
});

router.post('/:batchId/logs', async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(fermentationLogEntries).values({
    batch_id: c.req.param('batchId'),
    phase: body.phase ?? 'f1',
    ph: body.ph?.toString() ?? null,
    brix: body.brix?.toString() ?? null,
    temperature_c: body.temperature_c?.toString() ?? null,
    taste_notes: body.taste_notes || null,
    actions: body.actions || null,
    smell_color_notes: body.smell_color_notes || null,
    issues_or_flags: body.issues_or_flags || null,
  }).returning();
  return c.json(mapLog(row), 201);
});

router.delete('/:batchId/logs/:logId', async (c) => {
  await db.delete(fermentationLogEntries)
    .where(eq(fermentationLogEntries.id, c.req.param('logId')));
  return c.json({ success: true });
});

export default router;
