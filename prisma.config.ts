import { defineConfig } from "prisma/config";

// For migrations, DATABASE_URL is required (checked in migrate.js script)
// For local dev with SQLite, this won't be used for migrations
const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
