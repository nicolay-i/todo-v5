-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_TagToTodo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TagToTodo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TagToTodo_B_index" ON "public"."_TagToTodo"("B");

-- AddForeignKey
ALTER TABLE "public"."_TagToTodo" ADD CONSTRAINT "_TagToTodo_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TagToTodo" ADD CONSTRAINT "_TagToTodo_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
