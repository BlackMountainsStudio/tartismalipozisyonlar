import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  // Use Neon adapter for serverless PostgreSQL (Vercel/Neon)
  if (databaseUrl && (databaseUrl.includes("neon.tech") || databaseUrl.includes("@neon"))) {
    try {
      // Dynamic require to avoid bundling issues in serverless
      const { PrismaNeon } = require("@prisma/adapter-neon");
      const { neonConfig, Pool } = require("@neondatabase/serverless");
      neonConfig.fetchConnectionCache = true;
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaNeon(pool);
      return new PrismaClient({ adapter });
    } catch (error) {
      console.warn("Failed to use Neon adapter, falling back to default:", error);
    }
  }

  // Use pg adapter for regular PostgreSQL
  if (databaseUrl && (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://"))) {
    try {
      const { PrismaPg } = require("@prisma/adapter-pg");
      const { Pool } = require("pg");
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter });
    } catch (error) {
      console.warn("Failed to use pg adapter, falling back to default:", error);
    }
  }

  // If we have a PostgreSQL URL but no adapter, throw an error
  if (databaseUrl && !databaseUrl.startsWith("file:")) {
    throw new Error(
      `DATABASE_URL is set but no adapter available. Please ensure @prisma/adapter-neon or @prisma/adapter-pg is installed.`
    );
  }

  // This should never happen in production (PostgreSQL schema)
  // But TypeScript needs a return statement
  // In practice, this code path won't execute if DATABASE_URL is properly set
  throw new Error(
    "PrismaClient requires an adapter. DATABASE_URL must be set with a PostgreSQL connection string."
  );
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
