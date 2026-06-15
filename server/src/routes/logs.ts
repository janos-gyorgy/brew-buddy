import { Hono } from 'hono';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db.js';
import { fermentationLogEntries, batches } from '../schema.js';
import { toNum } from '../utils.js';
import type { AppEnv } from '../types.js';

const router = new Hono<AppEnv>();

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

// Confirms the batch exists and belongs to the current user.
async function ownsBatch(userId: string, batchId: string) {
  const row = await db.select({ id: batches.id }).from(batches)
    .where(and(eq(batches.id, batchId), eq(batches.user_id, userId)));
  return !!row[0];
}

router.get('/:batchId/logs', async (c) => {
  const userId = c.get('userId');
  if (!(await ownsBatch(userId, c.req.param('batchId')))) return c.json({ message: 'Not found' }, 404);
  const rows = await db.select().from(fermentationLogEntries)
    .where(and(
      eq(fermentationLogEntries.batch_id, c.req.param('batchId')),
      eq(fermentationLogEntries.user_id, userId),
    ))
    .orderBy(desc(fermentationLogEntries.timestamp));
  return c.json(rows.map(mapLog));
});

router.post('/:batchId/logs', async (c) => {
  const userId = c.get('userId');
  if (!(await ownsBatch(userId, c.req.param('batchId')))) return c.json({ message: 'Not found' }, 404);
  const body = await c.req.json();
  const [row] = await db.insert(fermentationLogEntries).values({
    user_id: userId,
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
    .where(and(
      eq(fermentationLogEntries.id, c.req.param('logId')),
      eq(fermentationLogEntries.user_id, c.get('userId')),
    ));
  return c.json({ success: true });
});

export default router;
