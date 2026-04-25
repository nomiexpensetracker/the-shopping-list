-- The Shopping List — Database Schema v8 (list_items unit column)
-- Additive migration. Run on an existing v7 database.
-- Safe to run multiple times (IF NOT EXISTS / ALTER COLUMN IF NOT EXISTS).

-- Add optional unit column to list_items.
-- Used to store the unit/description from quick list imports (e.g. "500 gr", "2 packs")
-- so it can be displayed separately from the item name.
ALTER TABLE list_items
  ADD COLUMN IF NOT EXISTS unit TEXT NULL;
