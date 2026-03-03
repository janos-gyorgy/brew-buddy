
-- Remove botanical columns from recipes (they belong in their own table)
ALTER TABLE public.recipes
DROP COLUMN IF EXISTS botanical_name,
DROP COLUMN IF EXISTS botanical_amount_g,
DROP COLUMN IF EXISTS botanical_water_ml,
DROP COLUMN IF EXISTS botanical_temp_c,
DROP COLUMN IF EXISTS botanical_steep_minutes;

-- Create standalone botanical_infusions table
CREATE TABLE public.botanical_infusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  ingredient text NOT NULL,
  amount_g numeric,
  water_ml numeric,
  temp_c numeric,
  steep_minutes integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.botanical_infusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own botanical infusions"
ON public.botanical_infusions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own botanical infusions"
ON public.botanical_infusions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own botanical infusions"
ON public.botanical_infusions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own botanical infusions"
ON public.botanical_infusions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_botanical_infusions_updated_at
BEFORE UPDATE ON public.botanical_infusions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
