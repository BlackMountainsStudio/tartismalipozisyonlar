-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "league" TEXT NOT NULL DEFAULT 'Süper Lig',
    "week" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "minute" INTEGER,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidenceScore" REAL NOT NULL,
    "sources" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Incident_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrawledContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rawContent" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrawledContent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
