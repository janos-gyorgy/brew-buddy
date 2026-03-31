import { pgTable, text, uuid, numeric, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const batchStatusEnum = pgEnum('batch_status', [
  'planned', 'fermenting_f1', 'ready_for_f2', 'fermenting_f2',
  'cold_crash', 'bottled', 'finished', 'failed',
]);
export const f2StatusEnum = pgEnum('f2_status', ['fermenting', 'cold_crash', 'ready', 'consumed', 'failed']);
export const fermentationPhaseEnum = pgEnum('fermentation_phase', ['f1', 'f2', 'cold_crash', 'storage']);
export const starterStatusEnum = pgEnum('starter_status', ['active', 'low_volume', 'retired']);

export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  intent_or_mood: text('intent_or_mood'),
  batch_size_liters: numeric('batch_size_liters'),
  tea_blend_description: text('tea_blend_description'),
  tea_amount_g_per_liter: numeric('tea_amount_g_per_liter'),
  steep_temperature_c: numeric('steep_temperature_c'),
  steep_time_minutes: integer('steep_time_minutes'),
  sugar_g_per_liter: numeric('sugar_g_per_liter'),
  sugar_type: text('sugar_type'),
  starter_percentage: numeric('starter_percentage'),
  starter_notes: text('starter_notes'),
  target_f1_days_min: integer('target_f1_days_min'),
  target_f1_days_max: integer('target_f1_days_max'),
  target_ph_range: text('target_ph_range'),
  target_brix_range: text('target_brix_range'),
  f2_fruit_ideas: text('f2_fruit_ideas'),
  f2_herb_spice_ideas: text('f2_herb_spice_ideas'),
  f2_sugar_or_juice_guidelines: text('f2_sugar_or_juice_guidelines'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const batches = pgTable('batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  batch_code: text('batch_code').notNull(),
  recipe_id: uuid('recipe_id').references(() => recipes.id),
  start_date: text('start_date').notNull(),
  status: batchStatusEnum('status').default('planned').notNull(),
  total_volume_liters: numeric('total_volume_liters').notNull(),
  vessel_type: text('vessel_type'),
  vessel_location: text('vessel_location'),
  initial_ph: numeric('initial_ph'),
  initial_brix: numeric('initial_brix'),
  ambient_temperature_c: numeric('ambient_temperature_c'),
  target_ready_date_f1: text('target_ready_date_f1'),
  starter_source: text('starter_source'),
  scoby_info: text('scoby_info'),
  general_notes: text('general_notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const fermentationLogEntries = pgTable('fermentation_log_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  batch_id: uuid('batch_id').notNull().references(() => batches.id, { onDelete: 'cascade' }),
  phase: fermentationPhaseEnum('phase').default('f1').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  ph: numeric('ph'),
  brix: numeric('brix'),
  temperature_c: numeric('temperature_c'),
  taste_notes: text('taste_notes'),
  actions: text('actions'),
  smell_color_notes: text('smell_color_notes'),
  issues_or_flags: text('issues_or_flags'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const f2VariantBatches = pgTable('f2_variant_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  parent_batch_id: uuid('parent_batch_id').notNull().references(() => batches.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  bottle_count: integer('bottle_count').notNull(),
  bottle_size_liters: numeric('bottle_size_liters').notNull(),
  fruits_and_juices: text('fruits_and_juices'),
  herbs_and_spices: text('herbs_and_spices'),
  other_additives: text('other_additives'),
  f2_start_date: text('f2_start_date').notNull(),
  expected_ready_date_f2: text('expected_ready_date_f2'),
  f2_status: f2StatusEnum('f2_status').default('fermenting').notNull(),
  tasting_notes: text('tasting_notes'),
  tasting_rating: integer('tasting_rating'),
  priming_sugar_g_per_bottle: numeric('priming_sugar_g_per_bottle'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const starterLog = pgTable('starter_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  creation_date: text('creation_date').notNull(),
  status: starterStatusEnum('status').default('active').notNull(),
  ph_at_creation: numeric('ph_at_creation'),
  current_ph: numeric('current_ph'),
  tea_blend_description: text('tea_blend_description'),
  sugar_g_per_liter: numeric('sugar_g_per_liter'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const botanicalInfusions = pgTable('botanical_infusions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ingredient: text('ingredient').notNull(),
  amount_g: numeric('amount_g'),
  water_ml: numeric('water_ml'),
  temp_c: numeric('temp_c'),
  steep_minutes: integer('steep_minutes'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const recipesRelations = relations(recipes, ({ many }) => ({
  batches: many(batches),
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
  recipe: one(recipes, { fields: [batches.recipe_id], references: [recipes.id] }),
  logs: many(fermentationLogEntries),
  f2Variants: many(f2VariantBatches),
}));

export const fermentationLogEntriesRelations = relations(fermentationLogEntries, ({ one }) => ({
  batch: one(batches, { fields: [fermentationLogEntries.batch_id], references: [batches.id] }),
}));

export const f2VariantBatchesRelations = relations(f2VariantBatches, ({ one }) => ({
  batch: one(batches, { fields: [f2VariantBatches.parent_batch_id], references: [batches.id] }),
}));
