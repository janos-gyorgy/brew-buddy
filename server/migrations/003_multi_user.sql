-- Multi-user support: a users table and a user_id owner column on every data
-- table. Columns are nullable so existing single-user rows can be backfilled to
-- the owner account (see server/src/seed-owner.ts); the API always sets user_id
-- going forward.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE recipes              ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE batches              ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE fermentation_log_entries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE f2_variant_batches   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE starter_log          ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE botanical_infusions  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_recipes_user             ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_user             ON batches(user_id);
CREATE INDEX IF NOT EXISTS idx_ferment_log_user         ON fermentation_log_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_f2_variant_user          ON f2_variant_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_starter_log_user         ON starter_log(user_id);
CREATE INDEX IF NOT EXISTS idx_botanical_infusions_user ON botanical_infusions(user_id);
