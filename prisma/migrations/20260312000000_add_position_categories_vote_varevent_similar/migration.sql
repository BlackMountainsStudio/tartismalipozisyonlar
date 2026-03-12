-- AlterTable
ALTER TABLE "Incident" ADD COLUMN "category" TEXT,
ADD COLUMN "refereeDecision" TEXT,
ADD COLUMN "varIntervention" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "decisionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarEvent" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "refereeDecision" TEXT,
    "varCalled" BOOLEAN NOT NULL DEFAULT false,
    "finalDecision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimilarPosition" (
    "positionId" TEXT NOT NULL,
    "similarPositionId" TEXT NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SimilarPosition_pkey" PRIMARY KEY ("positionId","similarPositionId")
);

-- CreateIndex
CREATE INDEX "Incident_category_idx" ON "Incident"("category");

-- CreateIndex
CREATE INDEX "Incident_varIntervention_idx" ON "Incident"("varIntervention");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_positionId_userId_key" ON "Vote"("positionId", "userId");

-- CreateIndex
CREATE INDEX "Vote_positionId_idx" ON "Vote"("positionId");

-- CreateIndex
CREATE INDEX "Vote_userId_idx" ON "Vote"("userId");

-- CreateIndex
CREATE INDEX "VarEvent_matchId_idx" ON "VarEvent"("matchId");

-- CreateIndex
CREATE INDEX "VarEvent_positionId_idx" ON "VarEvent"("positionId");

-- CreateIndex
CREATE INDEX "SimilarPosition_positionId_idx" ON "SimilarPosition"("positionId");

-- CreateIndex
CREATE INDEX "SimilarPosition_similarPositionId_idx" ON "SimilarPosition"("similarPositionId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarEvent" ADD CONSTRAINT "VarEvent_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarEvent" ADD CONSTRAINT "VarEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarPosition" ADD CONSTRAINT "SimilarPosition_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarPosition" ADD CONSTRAINT "SimilarPosition_similarPositionId_fkey" FOREIGN KEY ("similarPositionId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
