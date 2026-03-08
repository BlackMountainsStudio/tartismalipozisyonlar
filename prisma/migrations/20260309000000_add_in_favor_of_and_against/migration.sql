-- AlterTable
ALTER TABLE "Incident" ADD COLUMN "inFavorOf" TEXT,
ADD COLUMN "against" TEXT;

-- CreateIndex
CREATE INDEX "Incident_inFavorOf_idx" ON "Incident"("inFavorOf");

-- CreateIndex
CREATE INDEX "Incident_against_idx" ON "Incident"("against");
