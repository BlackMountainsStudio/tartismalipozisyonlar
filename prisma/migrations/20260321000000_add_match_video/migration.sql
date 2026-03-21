-- CreateTable
CREATE TABLE "MatchVideo" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "title" TEXT,
    "durationMin" INTEGER,
    "transcript" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchVideo_matchId_idx" ON "MatchVideo"("matchId");

-- AddForeignKey
ALTER TABLE "MatchVideo" ADD CONSTRAINT "MatchVideo_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
