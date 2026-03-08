-- Add slug to Match
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Unique index for slug (partial: only where slug IS NOT NULL so multiple NULLs allowed)
CREATE UNIQUE INDEX IF NOT EXISTS "Match_slug_key" ON "Match"("slug") WHERE "slug" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "Match_slug_idx" ON "Match"("slug");

-- Add slug to Incident
ALTER TABLE "Incident" ADD COLUMN IF NOT EXISTS "slug" TEXT;

CREATE INDEX IF NOT EXISTS "Incident_slug_idx" ON "Incident"("slug");
