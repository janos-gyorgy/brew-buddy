-- Remove the element column from recipes table as it's no longer needed
ALTER TABLE public.recipes DROP COLUMN IF EXISTS element;