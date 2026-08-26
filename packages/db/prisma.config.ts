import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const SHADOW_FALLBACK = "postgresql://postgres:postgres@localhost:5432/complaints_shadow";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL ?? SHADOW_FALLBACK,
  },
});
