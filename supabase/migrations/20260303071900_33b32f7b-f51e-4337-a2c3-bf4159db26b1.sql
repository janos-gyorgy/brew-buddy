
ALTER TABLE public.recipes
ADD COLUMN botanical_name text,
ADD COLUMN botanical_amount_g numeric,
ADD COLUMN botanical_water_ml numeric,
ADD COLUMN botanical_temp_c numeric,
ADD COLUMN botanical_steep_minutes integer;
