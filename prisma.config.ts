import { defineConfig, env } from "prisma/config";
import path from "node:path";

// Загрузка переменных окружения (обязательно при использовании config файла)
import "dotenv/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL")
  },
});
