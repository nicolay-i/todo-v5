-- Create User table
CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "telegramId" TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT,
  "username" TEXT,
  "photoUrl" TEXT,
  "languageCode" TEXT,
  "authDate" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add userId columns with default for existing rows
ALTER TABLE "Todo" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'legacy-user';
ALTER TABLE "PinnedList" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'legacy-user';
ALTER TABLE "Tag" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'legacy-user';

-- Seed legacy user if necessary
INSERT OR IGNORE INTO "User" ("id", "telegramId", "firstName", "authDate")
VALUES ('legacy-user', 'legacy-user', 'Legacy', CURRENT_TIMESTAMP);

-- Create foreign keys
PRAGMA foreign_keys = OFF;
CREATE TABLE "_new_Todo" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "completed" INTEGER NOT NULL DEFAULT 0,
  "completedAt" DATETIME,
  "pinned" INTEGER NOT NULL DEFAULT 0,
  "alias" TEXT,
  "position" INTEGER NOT NULL,
  "parentId" TEXT,
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Todo_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "_new_Todo" ("id", "title", "completed", "completedAt", "pinned", "alias", "position", "parentId", "userId", "createdAt", "updatedAt")
SELECT "id", "title", "completed", "completedAt", "pinned", "alias", "position", "parentId", "userId", "createdAt", "updatedAt" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "_new_Todo" RENAME TO "Todo";

CREATE TABLE "_new_PinnedList" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "isPrimary" INTEGER NOT NULL DEFAULT 0,
  "isActive" INTEGER NOT NULL DEFAULT 0,
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PinnedList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "_new_PinnedList" ("id", "title", "position", "isPrimary", "isActive", "userId", "createdAt", "updatedAt")
SELECT "id", "title", "position", "isPrimary", "isActive", "userId", "createdAt", "updatedAt" FROM "PinnedList";
DROP TABLE "PinnedList";
ALTER TABLE "_new_PinnedList" RENAME TO "PinnedList";

CREATE TABLE "_new_Tag" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "isSystem" INTEGER NOT NULL DEFAULT 0,
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "_new_Tag" ("id", "name", "position", "isSystem", "userId", "createdAt", "updatedAt")
SELECT "id", "name", "position", "isSystem", "userId", "createdAt", "updatedAt" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "_new_Tag" RENAME TO "Tag";
PRAGMA foreign_keys = ON;

-- Indexes for filtering
CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");
CREATE INDEX "PinnedList_userId_idx" ON "PinnedList"("userId");
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");
