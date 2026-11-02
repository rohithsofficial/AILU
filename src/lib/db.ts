import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 has no built-in query engine: the client needs a driver adapter.
// Runtime uses the pooled Neon URL (DATABASE_URL). Migrations use DIRECT_URL via prisma.config.ts.
const g = globalThis as unknown as { prisma?: PrismaClient };

export const dbConfigured = () => !!process.env.DATABASE_URL;

export function getPrisma(): PrismaClient {
  if (!g.prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    g.prisma = new PrismaClient({ adapter });
  }
  return g.prisma;
}
