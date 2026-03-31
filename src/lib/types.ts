export type BatchStatus =
  | 'planned' | 'fermenting_f1' | 'ready_for_f2' | 'fermenting_f2'
  | 'cold_crash' | 'bottled' | 'finished' | 'failed';

export type F2Status = 'fermenting' | 'cold_crash' | 'ready' | 'consumed' | 'failed';
export type FermentationPhase = 'f1' | 'f2' | 'cold_crash' | 'storage';
export type StarterStatus = 'active' | 'low_volume' | 'retired';

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  intent_or_mood: string | null;
  batch_size_liters: number | null;
  tea_blend_description: string | null;
  tea_amount_g_per_liter: number | null;
  steep_temperature_c: number | null;
  steep_time_minutes: number | null;
  sugar_g_per_liter: number | null;
  sugar_type: string | null;
  starter_percentage: number | null;
  starter_notes: string | null;
  target_f1_days_min: number | null;
  target_f1_days_max: number | null;
  target_ph_range: string | null;
  target_brix_range: string | null;
  f2_fruit_ideas: string | null;
  f2_herb_spice_ideas: string | null;
  f2_sugar_or_juice_guidelines: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  batch_code: string;
  recipe_id: string | null;
  start_date: string;
  status: BatchStatus;
  total_volume_liters: number;
  vessel_type: string | null;
  vessel_location: string | null;
  initial_ph: number | null;
  initial_brix: number | null;
  ambient_temperature_c: number | null;
  target_ready_date_f1: string | null;
  starter_source: string | null;
  scoby_info: string | null;
  general_notes: string | null;
  created_at: string;
  updated_at: string;
  recipes: { name: string } | null;
}

export interface FermentationLog {
  id: string;
  batch_id: string;
  phase: FermentationPhase;
  timestamp: string;
  ph: number | null;
  brix: number | null;
  temperature_c: number | null;
  taste_notes: string | null;
  actions: string | null;
  smell_color_notes: string | null;
  issues_or_flags: string | null;
  created_at: string;
}

export interface F2Variant {
  id: string;
  parent_batch_id: string;
  name: string;
  bottle_count: number;
  bottle_size_liters: number;
  fruits_and_juices: string | null;
  herbs_and_spices: string | null;
  other_additives: string | null;
  f2_start_date: string;
  expected_ready_date_f2: string | null;
  f2_status: F2Status;
  tasting_notes: string | null;
  tasting_rating: number | null;
  priming_sugar_g_per_bottle: number | null;
  created_at: string;
  updated_at: string;
  batches: {
    batch_code: string;
    recipe_id: string | null;
    recipes: { name: string } | null;
  } | null;
}

export interface BotanicalInfusion {
  id: string;
  name: string;
  ingredient: string;
  amount_g: number | null;
  water_ml: number | null;
  temp_c: number | null;
  steep_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
