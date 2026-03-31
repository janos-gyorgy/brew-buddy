import { z } from 'zod';

// Recipe validation schema
export const recipeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  intent_or_mood: z.string().max(100).optional(),
  
  batch_size_liters: z.number().positive('Must be positive').max(10000).optional(),
  tea_blend_description: z.string().max(500).optional(),
  tea_amount_g_per_liter: z.number().positive('Must be positive').max(1000).optional(),
  steep_temperature_c: z.number().positive('Must be positive').max(100).optional(),
  steep_time_minutes: z.number().positive('Must be positive').max(1440).optional(),
  sugar_g_per_liter: z.number().positive('Must be positive').max(1000).optional(),
  sugar_type: z.string().max(100).optional(),
  starter_percentage: z.number().positive('Must be positive').max(100).optional(),
  starter_notes: z.string().max(500).optional(),
  target_f1_days_min: z.number().positive('Must be positive').max(365).optional(),
  target_f1_days_max: z.number().positive('Must be positive').max(365).optional(),
  target_ph_range: z.string().max(50).optional(),
  target_brix_range: z.string().max(50).optional(),
  f2_fruit_ideas: z.string().max(1000).optional(),
  f2_herb_spice_ideas: z.string().max(1000).optional(),
  f2_sugar_or_juice_guidelines: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
});

// Batch validation schema
export const batchSchema = z.object({
  batch_code: z.string().trim().min(1, 'Batch code is required').max(100, 'Batch code must be less than 100 characters'),
  recipe_id: z.string().uuid('Invalid recipe').optional(),
  start_date: z.string().min(1, 'Start date is required'),
  target_ready_date_f1: z.string().optional(),
  total_volume_liters: z.number().positive('Volume must be positive').max(10000),
  vessel_type: z.string().max(100).optional(),
  vessel_location: z.string().max(200).optional(),
  ambient_temperature_c: z.number().max(100).optional(),
  initial_ph: z.number().positive('Must be positive').max(14).optional(),
  initial_brix: z.number().positive('Must be positive').max(100).optional(),
  starter_source: z.string().max(200).optional(),
  scoby_info: z.string().max(500).optional(),
  general_notes: z.string().max(2000).optional(),
});

// Fermentation log entry validation schema
export const fermentationLogSchema = z.object({
  ph: z.number().positive('Must be positive').max(14).optional(),
  brix: z.number().positive('Must be positive').max(100).optional(),
  temperature_c: z.number().max(100).optional(),
  taste_notes: z.string().max(1000).optional(),
  smell_color_notes: z.string().max(1000).optional(),
  issues_or_flags: z.string().max(1000).optional(),
  actions: z.string().max(1000).optional(),
});

// F2 variant validation schema
export const f2VariantSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  bottle_count: z.number().int().positive('Bottle count must be positive').max(10000),
  bottle_size_liters: z.number().positive('Bottle size must be positive').max(100),
  f2_start_date: z.string().min(1, 'F2 start date is required'),
  expected_ready_date_f2: z.string().optional(),
  fruits_and_juices: z.string().max(500).optional(),
  herbs_and_spices: z.string().max(500).optional(),
  other_additives: z.string().max(500).optional(),
  
});

// Tasting notes validation schema
export const tastingNotesSchema = z.object({
  tasting_notes: z.string().max(2000, 'Tasting notes must be less than 2000 characters').optional(),
  tasting_rating: z.number().int().min(1, 'Rating must be at least 1').max(10, 'Rating must be at most 10').optional(),
});
