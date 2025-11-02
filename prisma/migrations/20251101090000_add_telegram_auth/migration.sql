-- Create User table
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "telegramId" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT,
  "username" TEXT,
  "photoUrl" TEXT,
  "languageCode" TEXT,
  "authDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- Add userId columns to existing tables
ALTER TABLE "Todo" ADD COLUMN "userId" TEXT;
ALTER TABLE "PinnedList" ADD COLUMN "userId" TEXT;
ALTER TABLE "Tag" ADD COLUMN "userId" TEXT;

-- Seed legacy user for existing data
INSERT INTO "User" ("id", "telegramId", "firstName", "authDate")
VALUES ('legacy-user', 'legacy-user', 'Legacy', NOW())
ON CONFLICT ("telegramId") DO NOTHING;

UPDATE "Todo" SET "userId" = COALESCE("userId", 'legacy-user');
UPDATE "PinnedList" SET "userId" = COALESCE("userId", 'legacy-user');
UPDATE "Tag" SET "userId" = COALESCE("userId", 'legacy-user');

-- Enforce not null and foreign keys
ALTER TABLE "Todo" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "PinnedList" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Tag" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PinnedList" ADD CONSTRAINT "PinnedList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Helpful indexes for filtering by user
CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");
CREATE INDEX "PinnedList_userId_idx" ON "PinnedList"("userId");
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");
