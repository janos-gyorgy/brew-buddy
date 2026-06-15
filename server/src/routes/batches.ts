import { Hono } from 'hono';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db.js';
import { batches, recipes } from '../schema.js';
import { toNum } from '../utils.js';
import type { AppEnv } from '../types.js';

const router = new Hono<AppEnv>();

function mapBatch(row: typeof batches.$inferSelect & { recipe?: typeof recipes.$inferSelect | null }) {
  return {
    ...row,
    total_volume_liters: toNum(row.total_volume_liters)!,
    initial_ph: toNum(row.initial_ph),
    initial_brix: toNum(row.initial_brix),
    ambient_temperature_c: toNum(row.ambient_temperature_c),
    recipes: row.recipe ? { name: row.recipe.name } : null,
    recipe: undefined,
  };
}

router.get('/', async (c) => {
  const userId = c.get('userId');
  const recipeId = c.req.query('recipe_id');
  const rows = await db.query.batches.findMany({
    with: { recipe: { columns: { name: true } } },
    where: recipeId
      ? and(eq(batches.user_id, userId), eq(batches.recipe_id, recipeId))
      : eq(batches.user_id, userId),
    orderBy: [desc(batches.start_date)],
  });
  return c.json(rows.map((r) => mapBatch(r as any)));
});

router.get('/active', async (c) => {
  const rows = await db.query.batches.findMany({
    with: { recipe: { columns: { name: true } } },
    where: and(
      eq(batches.user_id, c.get('userId')),
      inArray(batches.status, ['fermenting_f1', 'ready_for_f2', 'fermenting_f2']),
    ),
    orderBy: [desc(batches.start_date)],
  });
  return c.json(rows.map((r) => mapBatch(r as any)));
});

router.get('/:id', async (c) => {
  const row = await db.query.batches.findFirst({
    with: { recipe: { columns: { name: true } } },
    where: and(eq(batches.id, c.req.param('id')), eq(batches.user_id, c.get('userId'))),
  });
  if (!row) return c.json({ message: 'Not found' }, 404);
  return c.json(mapBatch(row as any));
});

router.post('/', async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(batches).values({
    user_id: c.get('userId'),
    batch_code: body.batch_code,
    recipe_id: body.recipe_id || null,
    start_date: body.start_date,
    status: body.status ?? 'planned',
    total_volume_liters: body.total_volume_liters.toString(),
    vessel_type: body.vessel_type || null,
    vessel_location: body.vessel_location || null,
    initial_ph: body.initial_ph?.toString() ?? null,
    initial_brix: body.initial_brix?.toString() ?? null,
    ambient_temperature_c: body.ambient_temperature_c?.toString() ?? null,
    target_ready_date_f1: body.target_ready_date_f1 || null,
    starter_source: body.starter_source || null,
    scoby_info: body.scoby_info || null,
    general_notes: body.general_notes || null,
  }).returning();
  return c.json(mapBatch(row as any), 201);
});

router.put('/:id', async (c) => {
  const body = await c.req.json();
  const [row] = await db.update(batches).set({
    batch_code: body.batch_code,
    recipe_id: body.recipe_id || null,
    start_date: body.start_date,
    status: body.status,
    total_volume_liters: body.total_volume_liters?.toString(),
    vessel_type: body.vessel_type || null,
    vessel_location: body.vessel_location || null,
    initial_ph: body.initial_ph?.toString() ?? null,
    initial_brix: body.initial_brix?.toString() ?? null,
    ambient_temperature_c: body.ambient_temperature_c?.toString() ?? null,
    target_ready_date_f1: body.target_ready_date_f1 || null,
    starter_source: body.starter_source || null,
    scoby_info: body.scoby_info || null,
    general_notes: body.general_notes || null,
    updated_at: new Date(),
  }).where(and(eq(batches.id, c.req.param('id')), eq(batches.user_id, c.get('userId')))).returning();
  if (!row) return c.json({ message: 'Not found' }, 404);
  return c.json(mapBatch(row as any));
});

router.patch('/:id/status', async (c) => {
  const { status } = await c.req.json();
  const [row] = await db.update(batches).set({ status, updated_at: new Date() })
    .where(and(eq(batches.id, c.req.param('id')), eq(batches.user_id, c.get('userId')))).returning();
  if (!row) return c.json({ message: 'Not found' }, 404);
  return c.json(mapBatch(row as any));
});

router.delete('/:id', async (c) => {
  await db.delete(batches)
    .where(and(eq(batches.id, c.req.param('id')), eq(batches.user_id, c.get('userId'))));
  return c.json({ success: true });
});

export default router;
