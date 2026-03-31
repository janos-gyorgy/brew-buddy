import { Hono } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db.js';
import { recipes } from '../schema.js';

const router = new Hono();

const toNum = (v: string | null | undefined) =>
  v !== null && v !== undefined ? parseFloat(v) : null;

function mapRecipe(r: typeof recipes.$inferSelect) {
  return {
    ...r,
    batch_size_liters: toNum(r.batch_size_liters),
    tea_amount_g_per_liter: toNum(r.tea_amount_g_per_liter),
    steep_temperature_c: toNum(r.steep_temperature_c),
    sugar_g_per_liter: toNum(r.sugar_g_per_liter),
    starter_percentage: toNum(r.starter_percentage),
  };
}

router.get('/', async (c) => {
  const rows = await db.select().from(recipes).orderBy(desc(recipes.created_at));
  return c.json(rows.map(mapRecipe));
});

router.get('/:id', async (c) => {
  const row = await db.select().from(recipes).where(eq(recipes.id, c.req.param('id')));
  if (!row[0]) return c.json({ message: 'Not found' }, 404);
  return c.json(mapRecipe(row[0]));
});

router.post('/', async (c) => {
  const body = await c.req.json();
  const [row] = await db.insert(recipes).values({
    name: body.name,
    description: body.description || null,
    intent_or_mood: body.intent_or_mood || null,
    batch_size_liters: body.batch_size_liters?.toString() ?? null,
    tea_blend_description: body.tea_blend_description || null,
    tea_amount_g_per_liter: body.tea_amount_g_per_liter?.toString() ?? null,
    steep_temperature_c: body.steep_temperature_c?.toString() ?? null,
    steep_time_minutes: body.steep_time_minutes ?? null,
    sugar_g_per_liter: body.sugar_g_per_liter?.toString() ?? null,
    sugar_type: body.sugar_type || null,
    starter_percentage: body.starter_percentage?.toString() ?? null,
    starter_notes: body.starter_notes || null,
    target_f1_days_min: body.target_f1_days_min ?? null,
    target_f1_days_max: body.target_f1_days_max ?? null,
    target_ph_range: body.target_ph_range || null,
    target_brix_range: body.target_brix_range || null,
    f2_fruit_ideas: body.f2_fruit_ideas || null,
    f2_herb_spice_ideas: body.f2_herb_spice_ideas || null,
    f2_sugar_or_juice_guidelines: body.f2_sugar_or_juice_guidelines || null,
    notes: body.notes || null,
  }).returning();
  return c.json(mapRecipe(row), 201);
});

router.put('/:id', async (c) => {
  const body = await c.req.json();
  const [row] = await db.update(recipes).set({
    name: body.name,
    description: body.description || null,
    intent_or_mood: body.intent_or_mood || null,
    batch_size_liters: body.batch_size_liters?.toString() ?? null,
    tea_blend_description: body.tea_blend_description || null,
    tea_amount_g_per_liter: body.tea_amount_g_per_liter?.toString() ?? null,
    steep_temperature_c: body.steep_temperature_c?.toString() ?? null,
    steep_time_minutes: body.steep_time_minutes ?? null,
    sugar_g_per_liter: body.sugar_g_per_liter?.toString() ?? null,
    sugar_type: body.sugar_type || null,
    starter_percentage: body.starter_percentage?.toString() ?? null,
    starter_notes: body.starter_notes || null,
    target_f1_days_min: body.target_f1_days_min ?? null,
    target_f1_days_max: body.target_f1_days_max ?? null,
    target_ph_range: body.target_ph_range || null,
    target_brix_range: body.target_brix_range || null,
    f2_fruit_ideas: body.f2_fruit_ideas || null,
    f2_herb_spice_ideas: body.f2_herb_spice_ideas || null,
    f2_sugar_or_juice_guidelines: body.f2_sugar_or_juice_guidelines || null,
    notes: body.notes || null,
    updated_at: new Date(),
  }).where(eq(recipes.id, c.req.param('id'))).returning();
  if (!row) return c.json({ message: 'Not found' }, 404);
  return c.json(mapRecipe(row));
});

router.delete('/:id', async (c) => {
  await db.delete(recipes).where(eq(recipes.id, c.req.param('id')));
  return c.json({ success: true });
});

export default router;
