-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PinnedTodo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pinnedListId" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "PinnedTodo_pinnedListId_fkey" FOREIGN KEY ("pinnedListId") REFERENCES "PinnedList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PinnedTodo_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PinnedTodo" ("id", "pinnedListId", "position", "todoId") SELECT "id", "pinnedListId", "position", "todoId" FROM "PinnedTodo";
DROP TABLE "PinnedTodo";
ALTER TABLE "new_PinnedTodo" RENAME TO "PinnedTodo";
CREATE INDEX "PinnedTodo_pinnedListId_position_idx" ON "PinnedTodo"("pinnedListId", "position");
CREATE UNIQUE INDEX "PinnedTodo_pinnedListId_todoId_key" ON "PinnedTodo"("pinnedListId", "todoId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "username" TEXT,
    "photoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "firstName", "id", "lastName", "photoUrl", "telegramId", "updatedAt", "username") SELECT "createdAt", "firstName", "id", "lastName", "photoUrl", "telegramId", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
CREATE TABLE "new__TagToTodo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TagToTodo_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TagToTodo_B_fkey" FOREIGN KEY ("B") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__TagToTodo" ("A", "B") SELECT "A", "B" FROM "_TagToTodo";
DROP TABLE "_TagToTodo";
ALTER TABLE "new__TagToTodo" RENAME TO "_TagToTodo";
CREATE UNIQUE INDEX "_TagToTodo_AB_unique" ON "_TagToTodo"("A", "B");
CREATE INDEX "_TagToTodo_B_index" ON "_TagToTodo"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
