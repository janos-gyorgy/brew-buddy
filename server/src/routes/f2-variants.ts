import { Hono } from 'hono';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db.js';
import { f2VariantBatches, batches } from '../schema.js';
import { toNum } from '../utils.js';
import type { AppEnv } from '../types.js';

const router = new Hono<AppEnv>();

function mapVariant(row: any) {
  const batchData = row.batch ?? null;
  return {
    ...row,
    bottle_size_liters: toNum(row.bottle_size_liters)!,
    priming_sugar_g_per_bottle: toNum(row.priming_sugar_g_per_bottle),
    // Reshape to match Supabase join shape expected by frontend
    batches: batchData
      ? {
          batch_code: batchData.batch_code,
          recipe_id: batchData.recipe_id,
          recipes: batchData.recipe ? { name: batchData.recipe.name } : null,
        }
      : null,
    batch: undefined,
  };
}

// Confirms the parent batch exists and belongs to the current user.
async function ownsBatch(userId: string, batchId: string) {
  const row = await db.select({ id: batches.id }).from(batches)
    .where(and(eq(batches.id, batchId), eq(batches.user_id, userId)));
  return !!row[0];
}

router.get('/', async (c) => {
  const rows = await db.query.f2VariantBatches.findMany({
    with: { batch: { columns: { batch_code: true, recipe_id: true } } },
    where: eq(f2VariantBatches.user_id, c.get('userId')),
    orderBy: [desc(f2VariantBatches.f2_start_date)],
  });
  return c.json(rows.map(mapVariant));
});

router.get('/active', async (c) => {
  const rows = await db.query.f2VariantBatches.findMany({
    with: { batch: { columns: { batch_code: true, recipe_id: true } } },
    where: and(
      eq(f2VariantBatches.user_id, c.get('userId')),
      inArray(f2VariantBatches.f2_status, ['fermenting', 'cold_crash']),
    ),
    orderBy: [desc(f2VariantBatches.f2_start_date)],
  });
  return c.json(rows.map(mapVariant));
});

router.get('/by-batch/:batchId', async (c) => {
  const rows = await db.query.f2VariantBatches.findMany({
    with: { batch: { columns: { batch_code: true, recipe_id: true } } },
    where: and(
      eq(f2VariantBatches.parent_batch_id, c.req.param('batchId')),
      eq(f2VariantBatches.user_id, c.get('userId')),
    ),
    orderBy: [desc(f2VariantBatches.f2_start_date)],
  });
  return c.json(rows.map(mapVariant));
});

router.get('/:id', async (c) => {
  const row = await db.query.f2VariantBatches.findFirst({
    with: {
      batch: {
        columns: { batch_code: true, recipe_id: true },
        with: { recipe: { columns: { name: true } } },
      },
    },
    where: and(eq(f2VariantBatches.id, c.req.param('id')), eq(f2VariantBatches.user_id, c.get('userId'))),
  });
  if (!row) return c.json({ message: 'Not found' }, 404);
  return c.json(mapVariant(row));
});

router.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  if (!(await ownsBatch(userId, body.parent_batch_id))) return c.json({ message: 'Not found' }, 404);
  const [row] = await db.insert(f2VariantBatches).values({
    user_id: userId,
    parent_batch_id: body.parent_batch_id,
    name: body.name,
    bottle_count: body.bottle_count,
    bottle_size_liters: body.bottle_size_liters.toString(),
    fruits_and_juices: body.fruits_and_juices || null,
    herbs_and_spices: body.herbs_and_spices || null,
    other_additives: body.other_additives || null,
    f2_start_date: body.f2_start_date,
    expected_ready_date_f2: body.expected_ready_date_f2 || null,
    f2_status: body.f2_status ?? 'fermenting',
    priming_sugar_g_per_bottle: body.priming_sugar_g_per_bottle?.toString() ?? null,
  }).returning();
  return c.json(mapVariant(row), 201);
});

router.patch('/:id/status', async (c) => {
  const { f2_status } = await c.req.json();
  const [row] = await db.update(f2VariantBatches).set({ f2_status, updated_at: new Date() })
    .where(and(eq(f2VariantBatches.id, c.req.param('id')), eq(f2VariantBatches.user_id, c.get('userId')))).returning();
  if (!row) return c.json({ message: 'Not found' }, 404);
  return c.json(mapVariant(row));
});

router.patch('/:id/notes', async (c) => {
  const { tasting_rating, tasting_notes } = await c.req.json();
  const [row] = await db.update(f2VariantBatches).set({
    tasting_rating: tasting_rating ?? null,
    tasting_notes: tasting_notes ?? null,
    updated_at: new Date(),
  }).where(and(eq(f2VariantBatches.id, c.req.param('id')), eq(f2VariantBatches.user_id, c.get('userId')))).returning();
  if (!row) return c.json({ message: 'Not found' }, 404);
  return c.json(mapVariant(row));
});

router.delete('/:id', async (c) => {
  await db.delete(f2VariantBatches)
    .where(and(eq(f2VariantBatches.id, c.req.param('id')), eq(f2VariantBatches.user_id, c.get('userId'))));
  return c.json({ success: true });
});

export default router;
