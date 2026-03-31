import { Hono } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db.js';
import { starterLog } from '../schema.js';
import { toNum } from '../utils.js';

const router = new Hono();

function mapStarter(r: typeof starterLog.$inferSelect) {
  return {
    ...r,
    ph_at_creation: toNum(r.ph_at_creation),
    current_ph: toNum(r.current_ph),
    sugar_g_per_liter: toNum(r.sugar_g_per_liter),
  };
}

router.get('/', async (c) => {
  const rows = await db.select().from(starterLog).orderBy(desc(starterLog.creation_date));
  return c.json(rows.map(mapStarter));
});

router.post('/', async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(starterLog).values({
    name: body.name,
    creation_date: body.creation_date,
    status: body.status ?? 'active',
    ph_at_creation: body.ph_at_creation?.toString() ?? null,
    current_ph: body.current_ph?.toString() ?? null,
    tea_blend_description: body.tea_blend_description || null,
    sugar_g_per_liter: body.sugar_g_per_liter?.toString() ?? null,
    notes: body.notes || null,
  }).returning();
  return c.json(mapStarter(row), 201);
});

router.put('/:id', async (c) => {
  const body = await c.req.json();
  const [row] = await db.update(starterLog).set({
    name: body.name,
    creation_date: body.creation_date,
    status: body.status,
    ph_at_creation: body.ph_at_creation?.toString() ?? null,
    current_ph: body.current_ph?.toString() ?? null,
    tea_blend_description: body.tea_blend_description || null,
    sugar_g_per_liter: body.sugar_g_per_liter?.toString() ?? null,
    notes: body.notes || null,
    updated_at: new Date(),
  }).where(eq(starterLog.id, c.req.param('id'))).returning();
  if (!row) return c.json({ message: 'Not found' }, 404);
  return c.json(mapStarter(row));
});

router.delete('/:id', async (c) => {
  await db.delete(starterLog).where(eq(starterLog.id, c.req.param('id')));
  return c.json({ success: true });
});

export default router;
