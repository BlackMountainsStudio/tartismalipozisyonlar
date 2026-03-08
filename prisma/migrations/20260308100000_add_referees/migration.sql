-- CreateTable Referee
CREATE TABLE IF NOT EXISTS "Referee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'REFEREE',
    "bio" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referee_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Referee_slug_key" ON "Referee"("slug");
CREATE INDEX IF NOT EXISTS "Referee_slug_idx" ON "Referee"("slug");
CREATE INDEX IF NOT EXISTS "Referee_role_idx" ON "Referee"("role");

-- Add referee columns to Match
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "refereeId" TEXT;
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "varRefereeId" TEXT;

CREATE INDEX IF NOT EXISTS "Match_refereeId_idx" ON "Match"("refereeId");
CREATE INDEX IF NOT EXISTS "Match_varRefereeId_idx" ON "Match"("varRefereeId");
