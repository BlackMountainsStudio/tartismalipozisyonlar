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

  // Default: Prisma will use DATABASE_URL from environment
  // If no adapter available, use default PrismaClient with empty config
  return new PrismaClient({});
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
