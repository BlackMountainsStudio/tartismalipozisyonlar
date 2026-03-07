-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "league" TEXT NOT NULL DEFAULT 'Süper Lig',
    "week" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "minute" INTEGER,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "sources" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawledContent" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rawContent" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrawledContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Match_homeTeam_idx" ON "Match"("homeTeam");

-- CreateIndex
CREATE INDEX "Match_awayTeam_idx" ON "Match"("awayTeam");

-- CreateIndex
CREATE INDEX "Match_week_idx" ON "Match"("week");

-- CreateIndex
CREATE INDEX "Incident_matchId_idx" ON "Incident"("matchId");

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "Incident"("status");

-- CreateIndex
CREATE INDEX "Incident_type_idx" ON "Incident"("type");

-- CreateIndex
CREATE UNIQUE INDEX "CrawledContent_url_key" ON "CrawledContent"("url");

-- CreateIndex
CREATE INDEX "CrawledContent_matchId_idx" ON "CrawledContent"("matchId");

-- CreateIndex
CREATE INDEX "CrawledContent_source_idx" ON "CrawledContent"("source");

-- CreateIndex
CREATE INDEX "CrawledContent_processed_idx" ON "CrawledContent"("processed");

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledContent" ADD CONSTRAINT "CrawledContent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
