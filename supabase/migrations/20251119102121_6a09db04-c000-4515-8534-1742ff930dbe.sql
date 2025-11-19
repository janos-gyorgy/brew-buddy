-- Create enum types for statuses
CREATE TYPE batch_status AS ENUM (
  'planned',
  'fermenting_f1',
  'ready_for_f2',
  'fermenting_f2',
  'cold_crash',
  'bottled',
  'finished',
  'failed'
);

CREATE TYPE f2_status AS ENUM (
  'fermenting',
  'cold_crash',
  'ready',
  'consumed',
  'failed'
);

CREATE TYPE fermentation_phase AS ENUM (
  'f1',
  'f2',
  'cold_crash',
  'storage'
);

CREATE TYPE starter_status AS ENUM (
  'active',
  'low_volume',
  'retired'
);

-- Recipes table
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  intent_or_mood TEXT,
  element TEXT,
  batch_size_liters NUMERIC(10, 2),
  
  -- Tea info
  tea_blend_description TEXT,
  tea_amount_g_per_liter NUMERIC(10, 2),
  steep_temperature_c NUMERIC(5, 1),
  steep_time_minutes INTEGER,
  
  -- Sugar
  sugar_g_per_liter NUMERIC(10, 2),
  sugar_type TEXT,
  
  -- Starter
  starter_percentage NUMERIC(5, 2),
  starter_notes TEXT,
  
  -- Fermentation targets
  target_f1_days_min INTEGER,
  target_f1_days_max INTEGER,
  target_ph_range TEXT,
  target_brix_range TEXT,
  
  -- F2 suggestions
  f2_fruit_ideas TEXT,
  f2_herb_spice_ideas TEXT,
  f2_sugar_or_juice_guidelines TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Batches table
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT UNIQUE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  status batch_status NOT NULL DEFAULT 'planned',
  total_volume_liters NUMERIC(10, 2) NOT NULL,
  vessel_type TEXT,
  vessel_location TEXT,
  initial_ph NUMERIC(4, 2),
  initial_brix NUMERIC(5, 2),
  ambient_temperature_c NUMERIC(5, 1),
  target_ready_date_f1 DATE,
  starter_source TEXT,
  scoby_info TEXT,
  general_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fermentation log entries table
CREATE TABLE public.fermentation_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  phase fermentation_phase NOT NULL DEFAULT 'f1',
  ph NUMERIC(4, 2),
  brix NUMERIC(5, 2),
  temperature_c NUMERIC(5, 1),
  taste_notes TEXT,
  actions TEXT,
  smell_color_notes TEXT,
  issues_or_flags TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- F2 variant batches table
CREATE TABLE public.f2_variant_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bottle_count INTEGER NOT NULL,
  bottle_size_liters NUMERIC(5, 3) NOT NULL,
  
  -- Flavor additives
  fruits_and_juices TEXT,
  herbs_and_spices TEXT,
  other_additives TEXT,
  priming_sugar_g_per_bottle NUMERIC(10, 2),
  
  f2_start_date DATE NOT NULL,
  expected_ready_date_f2 DATE,
  f2_status f2_status NOT NULL DEFAULT 'fermenting',
  tasting_rating INTEGER CHECK (tasting_rating >= 1 AND tasting_rating <= 10),
  tasting_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Starter log table
CREATE TABLE public.starter_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creation_date DATE NOT NULL,
  tea_blend_description TEXT,
  sugar_g_per_liter NUMERIC(10, 2),
  ph_at_creation NUMERIC(4, 2),
  current_ph NUMERIC(4, 2),
  status starter_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX idx_batches_recipe_id ON public.batches(recipe_id);
CREATE INDEX idx_batches_status ON public.batches(status);
CREATE INDEX idx_batches_start_date ON public.batches(start_date);
CREATE INDEX idx_fermentation_log_batch_id ON public.fermentation_log_entries(batch_id);
CREATE INDEX idx_fermentation_log_timestamp ON public.fermentation_log_entries(timestamp DESC);
CREATE INDEX idx_f2_variant_parent_batch_id ON public.f2_variant_batches(parent_batch_id);
CREATE INDEX idx_f2_variant_status ON public.f2_variant_batches(f2_status);

-- Triggers for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at
BEFORE UPDATE ON public.batches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_f2_variant_batches_updated_at
BEFORE UPDATE ON public.f2_variant_batches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_starter_log_updated_at
BEFORE UPDATE ON public.starter_log
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();