-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "username" TEXT,
    "photoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

INSERT INTO "User" ("id", "telegramId", "firstName", "createdAt", "updatedAt")
VALUES ('seed-user', 'seed-user', 'Seed user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER TABLE "Todo" RENAME TO "Todo_old";
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "alias" TEXT,
    "position" INTEGER NOT NULL,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Todo_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "Todo" ("id", "title", "completed", "completedAt", "pinned", "alias", "position", "parentId", "userId", "createdAt", "updatedAt")
SELECT "id", "title", "completed", "completedAt", "pinned", "alias", "position", "parentId", 'seed-user', "createdAt", "updatedAt" FROM "Todo_old";
DROP TABLE "Todo_old";
CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");

ALTER TABLE "PinnedList" RENAME TO "PinnedList_old";
CREATE TABLE "PinnedList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PinnedList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "PinnedList" ("id", "title", "position", "isPrimary", "isActive", "userId", "createdAt", "updatedAt")
SELECT "id", "title", "position", "isPrimary", "isActive", 'seed-user', "createdAt", "updatedAt" FROM "PinnedList_old";
DROP TABLE "PinnedList_old";
CREATE INDEX "PinnedList_userId_idx" ON "PinnedList"("userId");

ALTER TABLE "Tag" RENAME TO "Tag_old";
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "Tag" ("id", "name", "position", "isSystem", "userId", "createdAt", "updatedAt")
SELECT "id", "name", COALESCE("position", 0), COALESCE("isSystem", 0), 'seed-user', "createdAt", "updatedAt" FROM "Tag_old";
DROP TABLE "Tag_old";
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
