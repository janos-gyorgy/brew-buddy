-- Update RLS policies to require authentication instead of allowing public access

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on recipes" ON public.recipes;
DROP POLICY IF EXISTS "Allow all operations on batches" ON public.batches;
DROP POLICY IF EXISTS "Allow all operations on fermentation_log_entries" ON public.fermentation_log_entries;
DROP POLICY IF EXISTS "Allow all operations on f2_variant_batches" ON public.f2_variant_batches;
DROP POLICY IF EXISTS "Allow all operations on starter_log" ON public.starter_log;

-- Create authenticated-only policies for recipes
CREATE POLICY "Authenticated users can view recipes" ON public.recipes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete recipes" ON public.recipes
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create authenticated-only policies for batches
CREATE POLICY "Authenticated users can view batches" ON public.batches
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create batches" ON public.batches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update batches" ON public.batches
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete batches" ON public.batches
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create authenticated-only policies for fermentation_log_entries
CREATE POLICY "Authenticated users can view log entries" ON public.fermentation_log_entries
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create log entries" ON public.fermentation_log_entries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update log entries" ON public.fermentation_log_entries
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete log entries" ON public.fermentation_log_entries
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create authenticated-only policies for f2_variant_batches
CREATE POLICY "Authenticated users can view f2 variants" ON public.f2_variant_batches
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create f2 variants" ON public.f2_variant_batches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update f2 variants" ON public.f2_variant_batches
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete f2 variants" ON public.f2_variant_batches
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create authenticated-only policies for starter_log
CREATE POLICY "Authenticated users can view starter log" ON public.starter_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create starter log" ON public.starter_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update starter log" ON public.starter_log
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete starter log" ON public.starter_log
  FOR DELETE USING (auth.uid() IS NOT NULL);