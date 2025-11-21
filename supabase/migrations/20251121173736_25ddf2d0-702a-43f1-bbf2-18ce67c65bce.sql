-- Add user_id columns to all tables
ALTER TABLE public.recipes ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.batches ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.fermentation_log_entries ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.f2_variant_batches ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.starter_log ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_batches_user_id ON public.batches(user_id);
CREATE INDEX idx_fermentation_log_entries_user_id ON public.fermentation_log_entries(user_id);
CREATE INDEX idx_f2_variant_batches_user_id ON public.f2_variant_batches(user_id);
CREATE INDEX idx_starter_log_user_id ON public.starter_log(user_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated users can create recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated users can update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated users can delete recipes" ON public.recipes;

DROP POLICY IF EXISTS "Authenticated users can view batches" ON public.batches;
DROP POLICY IF EXISTS "Authenticated users can create batches" ON public.batches;
DROP POLICY IF EXISTS "Authenticated users can update batches" ON public.batches;
DROP POLICY IF EXISTS "Authenticated users can delete batches" ON public.batches;

DROP POLICY IF EXISTS "Authenticated users can view log entries" ON public.fermentation_log_entries;
DROP POLICY IF EXISTS "Authenticated users can create log entries" ON public.fermentation_log_entries;
DROP POLICY IF EXISTS "Authenticated users can update log entries" ON public.fermentation_log_entries;
DROP POLICY IF EXISTS "Authenticated users can delete log entries" ON public.fermentation_log_entries;

DROP POLICY IF EXISTS "Authenticated users can view f2 variants" ON public.f2_variant_batches;
DROP POLICY IF EXISTS "Authenticated users can create f2 variants" ON public.f2_variant_batches;
DROP POLICY IF EXISTS "Authenticated users can update f2 variants" ON public.f2_variant_batches;
DROP POLICY IF EXISTS "Authenticated users can delete f2 variants" ON public.f2_variant_batches;

DROP POLICY IF EXISTS "Authenticated users can view starter log" ON public.starter_log;
DROP POLICY IF EXISTS "Authenticated users can create starter log" ON public.starter_log;
DROP POLICY IF EXISTS "Authenticated users can update starter log" ON public.starter_log;
DROP POLICY IF EXISTS "Authenticated users can delete starter log" ON public.starter_log;

-- Create user-specific policies for recipes
CREATE POLICY "Users can view their own recipes" ON public.recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific policies for batches
CREATE POLICY "Users can view their own batches" ON public.batches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own batches" ON public.batches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batches" ON public.batches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own batches" ON public.batches
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific policies for fermentation log entries
CREATE POLICY "Users can view their own log entries" ON public.fermentation_log_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own log entries" ON public.fermentation_log_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own log entries" ON public.fermentation_log_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own log entries" ON public.fermentation_log_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific policies for f2 variants
CREATE POLICY "Users can view their own f2 variants" ON public.f2_variant_batches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own f2 variants" ON public.f2_variant_batches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own f2 variants" ON public.f2_variant_batches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own f2 variants" ON public.f2_variant_batches
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific policies for starter log
CREATE POLICY "Users can view their own starter log" ON public.starter_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own starter log" ON public.starter_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own starter log" ON public.starter_log
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own starter log" ON public.starter_log
  FOR DELETE USING (auth.uid() = user_id);