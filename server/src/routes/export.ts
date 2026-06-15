import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { recipes, batches, f2VariantBatches, fermentationLogEntries, starterLog } from '../schema.js';
import type { AppEnv } from '../types.js';

const router = new Hono<AppEnv>();

router.get('/', async (c) => {
  const userId = c.get('userId');
  const [allRecipes, allBatches, allF2, allLogs, allStarters] = await Promise.all([
    db.select().from(recipes).where(eq(recipes.user_id, userId)),
    db.select().from(batches).where(eq(batches.user_id, userId)),
    db.select().from(f2VariantBatches).where(eq(f2VariantBatches.user_id, userId)),
    db.select().from(fermentationLogEntries).where(eq(fermentationLogEntries.user_id, userId)),
    db.select().from(starterLog).where(eq(starterLog.user_id, userId)),
  ]);

  let text = '=== BREW BUDDY DATA EXPORT ===\n\n';
  text += `Export Date: ${new Date().toISOString()}\n\n`;

  text += '=== RECIPES ===\n\n';
  allRecipes.forEach((r) => {
    text += `Recipe: ${r.name}\n`;
    text += `Description: ${r.description || 'N/A'}\n`;
    text += `Batch Size: ${r.batch_size_liters}L\n`;
    text += `Tea: ${r.tea_amount_g_per_liter}g/L - ${r.tea_blend_description || 'N/A'}\n`;
    text += `Sugar: ${r.sugar_g_per_liter}g/L ${r.sugar_type || ''}\n`;
    text += `F1 Target: ${r.target_f1_days_min}-${r.target_f1_days_max} days\n`;
    text += `Notes: ${r.notes || 'N/A'}\n\n`;
  });

  text += '\n=== BATCHES ===\n\n';
  allBatches.forEach((b) => {
    text += `Batch: ${b.batch_code}\n`;
    text += `Status: ${b.status}\n`;
    text += `Start Date: ${b.start_date}\n`;
    text += `Volume: ${b.total_volume_liters}L\n`;
    text += `Initial pH: ${b.initial_ph || 'N/A'}\n`;
    text += `Initial Brix: ${b.initial_brix || 'N/A'}\n`;
    text += `Notes: ${b.general_notes || 'N/A'}\n\n`;
  });

  text += '\n=== F2 VARIANTS ===\n\n';
  allF2.forEach((v) => {
    text += `Variant: ${v.name}\n`;
    text += `Status: ${v.f2_status}\n`;
    text += `Start Date: ${v.f2_start_date}\n`;
    text += `Bottles: ${v.bottle_count} x ${v.bottle_size_liters}L\n`;
    text += `Fruits: ${v.fruits_and_juices || 'N/A'}\n`;
    text += `Herbs: ${v.herbs_and_spices || 'N/A'}\n`;
    text += `Rating: ${v.tasting_rating ? `${v.tasting_rating}/10` : 'N/A'}\n`;
    text += `Notes: ${v.tasting_notes || 'N/A'}\n\n`;
  });

  text += '\n=== FERMENTATION LOGS ===\n\n';
  allLogs.forEach((l) => {
    text += `Date: ${new Date(l.timestamp).toLocaleString()}\n`;
    text += `Phase: ${l.phase}\n`;
    text += `pH: ${l.ph || 'N/A'}\n`;
    text += `Brix: ${l.brix || 'N/A'}\n`;
    text += `Temp: ${l.temperature_c ? `${l.temperature_c}°C` : 'N/A'}\n`;
    text += `Notes: ${l.smell_color_notes || l.taste_notes || 'N/A'}\n\n`;
  });

  text += '\n=== STARTER LOG ===\n\n';
  allStarters.forEach((s) => {
    text += `Name: ${s.name}\n`;
    text += `Status: ${s.status}\n`;
    text += `Created: ${s.creation_date}\n`;
    text += `pH: ${s.current_ph || 'N/A'}\n`;
    text += `Notes: ${s.notes || 'N/A'}\n\n`;
  });

  return c.text(text, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
});

export default router;
