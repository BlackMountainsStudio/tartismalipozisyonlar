-- Comment: parentId for replies
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
CREATE INDEX IF NOT EXISTS "Comment_parentId_idx" ON "Comment"("parentId");
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CommentReport table
CREATE TABLE IF NOT EXISTS "CommentReport" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReport_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CommentReport_commentId_userId_key" ON "CommentReport"("commentId", "userId");
CREATE INDEX IF NOT EXISTS "CommentReport_commentId_idx" ON "CommentReport"("commentId");
CREATE INDEX IF NOT EXISTS "CommentReport_userId_idx" ON "CommentReport"("userId");
ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Suggestion: userId
ALTER TABLE "Suggestion" ADD COLUMN IF NOT EXISTS "userId" TEXT;
CREATE INDEX IF NOT EXISTS "Suggestion_userId_idx" ON "Suggestion"("userId");
