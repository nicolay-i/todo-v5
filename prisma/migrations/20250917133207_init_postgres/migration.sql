-- CreateTable
CREATE TABLE "public"."Todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PinnedList" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PinnedList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PinnedTodo" (
    "id" SERIAL NOT NULL,
    "pinnedListId" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "PinnedTodo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PinnedTodo_pinnedListId_position_idx" ON "public"."PinnedTodo"("pinnedListId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "PinnedTodo_pinnedListId_todoId_key" ON "public"."PinnedTodo"("pinnedListId", "todoId");

-- AddForeignKey
ALTER TABLE "public"."Todo" ADD CONSTRAINT "Todo_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PinnedTodo" ADD CONSTRAINT "PinnedTodo_pinnedListId_fkey" FOREIGN KEY ("pinnedListId") REFERENCES "public"."PinnedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PinnedTodo" ADD CONSTRAINT "PinnedTodo_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "public"."Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
