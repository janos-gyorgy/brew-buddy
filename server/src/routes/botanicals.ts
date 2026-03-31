import { Hono } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db.js';
import { botanicalInfusions } from '../schema.js';
import { toNum } from '../utils.js';

const router = new Hono();

function mapInfusion(r: typeof botanicalInfusions.$inferSelect) {
  return {
    ...r,
    amount_g: toNum(r.amount_g),
    water_ml: toNum(r.water_ml),
    temp_c: toNum(r.temp_c),
  };
}

router.get('/', async (c) => {
  const rows = await db.select().from(botanicalInfusions).orderBy(desc(botanicalInfusions.created_at));
  return c.json(rows.map(mapInfusion));
});

router.post('/', async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(botanicalInfusions).values({
    name: body.name,
    ingredient: body.ingredient,
    amount_g: body.amount_g?.toString() ?? null,
    water_ml: body.water_ml?.toString() ?? null,
    temp_c: body.temp_c?.toString() ?? null,
    steep_minutes: body.steep_minutes ?? null,
    notes: body.notes || null,
  }).returning();
  return c.json(mapInfusion(row), 201);
});

router.put('/:id', async (c) => {
  const body = await c.req.json();
  const [row] = await db.update(botanicalInfusions).set({
    name: body.name,
    ingredient: body.ingredient,
    amount_g: body.amount_g?.toString() ?? null,
    water_ml: body.water_ml?.toString() ?? null,
    temp_c: body.temp_c?.toString() ?? null,
    steep_minutes: body.steep_minutes ?? null,
    notes: body.notes || null,
    updated_at: new Date(),
  }).where(eq(botanicalInfusions.id, c.req.param('id'))).returning();
  if (!row) return c.json({ message: 'Not found' }, 404);
  return c.json(mapInfusion(row));
});

router.delete('/:id', async (c) => {
  await db.delete(botanicalInfusions).where(eq(botanicalInfusions.id, c.req.param('id')));
  return c.json({ success: true });
});

export default router;
