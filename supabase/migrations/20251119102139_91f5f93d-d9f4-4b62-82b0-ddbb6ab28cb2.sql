-- Enable Row Level Security on all tables
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fermentation_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f2_variant_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starter_log ENABLE ROW LEVEL SECURITY;

-- For single-user app: Allow all operations for any user
-- (Can be refined later with user_id columns if multi-user is needed)

-- Recipes policies
CREATE POLICY "Allow all operations on recipes"
ON public.recipes
FOR ALL
USING (true)
WITH CHECK (true);

-- Batches policies
CREATE POLICY "Allow all operations on batches"
ON public.batches
FOR ALL
USING (true)
WITH CHECK (true);

-- Fermentation log entries policies
CREATE POLICY "Allow all operations on fermentation_log_entries"
ON public.fermentation_log_entries
FOR ALL
USING (true)
WITH CHECK (true);

-- F2 variant batches policies
CREATE POLICY "Allow all operations on f2_variant_batches"
ON public.f2_variant_batches
FOR ALL
USING (true)
WITH CHECK (true);

-- Starter log policies
CREATE POLICY "Allow all operations on starter_log"
ON public.starter_log
FOR ALL
USING (true)
WITH CHECK (true);

-- Fix the function search path issue
ALTER FUNCTION update_updated_at_column() SET search_path = public;