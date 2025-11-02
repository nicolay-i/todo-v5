-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "username" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

INSERT INTO "User" ("id", "telegramId", "firstName", "createdAt", "updatedAt")
VALUES ('seed-user', 'seed-user', 'Seed user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "Todo" ADD COLUMN "userId" TEXT;
UPDATE "Todo" SET "userId" = 'seed-user' WHERE "userId" IS NULL;
ALTER TABLE "Todo" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");

ALTER TABLE "PinnedList" ADD COLUMN "userId" TEXT;
UPDATE "PinnedList" SET "userId" = 'seed-user' WHERE "userId" IS NULL;
ALTER TABLE "PinnedList" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "PinnedList" ADD CONSTRAINT "PinnedList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "PinnedList_userId_idx" ON "PinnedList"("userId");

ALTER TABLE "Tag" ADD COLUMN "userId" TEXT;
UPDATE "Tag" SET "userId" = 'seed-user' WHERE "userId" IS NULL;
ALTER TABLE "Tag" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");
