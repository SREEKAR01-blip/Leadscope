-- Add place_id column for Google Places deduplication.
-- We use a unique constraint so upserts keyed on place_id are safe across
-- repeated searches of the same zip code / city.
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS place_id text;

-- Backfill existing rows (if any) with a synthetic value so the unique
-- constraint can be added cleanly even when rows already exist.
UPDATE leads
  SET place_id = 'legacy_' || id::text
  WHERE place_id IS NULL;

-- Now enforce uniqueness. place_id is nullable so non-Google rows can still
-- coexist, but any non-null value must be unique.
CREATE UNIQUE INDEX IF NOT EXISTS leads_place_id_unique_idx
  ON leads (place_id)
  WHERE place_id IS NOT NULL;
