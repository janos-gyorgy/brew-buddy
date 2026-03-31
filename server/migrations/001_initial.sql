CREATE TYPE batch_status AS ENUM (
  'planned', 'fermenting_f1', 'ready_for_f2', 'fermenting_f2',
  'cold_crash', 'bottled', 'finished', 'failed'
);
CREATE TYPE f2_status AS ENUM ('fermenting', 'cold_crash', 'ready', 'consumed', 'failed');
CREATE TYPE fermentation_phase AS ENUM ('f1', 'f2', 'cold_crash', 'storage');
CREATE TYPE starter_status AS ENUM ('active', 'low_volume', 'retired');

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  intent_or_mood TEXT,
  batch_size_liters NUMERIC,
  tea_blend_description TEXT,
  tea_amount_g_per_liter NUMERIC,
  steep_temperature_c NUMERIC,
  steep_time_minutes INTEGER,
  sugar_g_per_liter NUMERIC,
  sugar_type TEXT,
  starter_percentage NUMERIC,
  starter_notes TEXT,
  target_f1_days_min INTEGER,
  target_f1_days_max INTEGER,
  target_ph_range TEXT,
  target_brix_range TEXT,
  f2_fruit_ideas TEXT,
  f2_herb_spice_ideas TEXT,
  f2_sugar_or_juice_guidelines TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT NOT NULL,
  recipe_id UUID REFERENCES recipes(id),
  start_date TEXT NOT NULL,
  status batch_status NOT NULL DEFAULT 'planned',
  total_volume_liters NUMERIC NOT NULL,
  vessel_type TEXT,
  vessel_location TEXT,
  initial_ph NUMERIC,
  initial_brix NUMERIC,
  ambient_temperature_c NUMERIC,
  target_ready_date_f1 TEXT,
  starter_source TEXT,
  scoby_info TEXT,
  general_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fermentation_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  phase fermentation_phase NOT NULL DEFAULT 'f1',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ph NUMERIC,
  brix NUMERIC,
  temperature_c NUMERIC,
  taste_notes TEXT,
  actions TEXT,
  smell_color_notes TEXT,
  issues_or_flags TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE f2_variant_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bottle_count INTEGER NOT NULL,
  bottle_size_liters NUMERIC NOT NULL,
  fruits_and_juices TEXT,
  herbs_and_spices TEXT,
  other_additives TEXT,
  f2_start_date TEXT NOT NULL,
  expected_ready_date_f2 TEXT,
  f2_status f2_status NOT NULL DEFAULT 'fermenting',
  tasting_notes TEXT,
  tasting_rating INTEGER,
  priming_sugar_g_per_bottle NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE starter_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creation_date TEXT NOT NULL,
  status starter_status NOT NULL DEFAULT 'active',
  ph_at_creation NUMERIC,
  current_ph NUMERIC,
  tea_blend_description TEXT,
  sugar_g_per_liter NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE botanical_infusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ingredient TEXT NOT NULL,
  amount_g NUMERIC,
  water_ml NUMERIC,
  temp_c NUMERIC,
  steep_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
