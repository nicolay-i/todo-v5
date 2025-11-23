import { defineConfig } from "prisma/config";
import path from "node:path";

// Загрузка переменных окружения (обязательно при использовании config файла)
import "dotenv/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", process.env.DATABASE_MODE == "sqlite" ? "migrations-sqlite" : "migrations"),
  },
});
