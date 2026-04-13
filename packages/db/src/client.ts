// packages/db/src/client.ts
import path from "path";
import dotenv from "dotenv";

// Load .env from db package root so any app importing @repo/db gets DATABASE_URL
dotenv.config({ path: path.join(__dirname, "..", ".env") });
// Also load from repo root (when running from apps/*, root .env is not in cwd)
dotenv.config({ path: path.join(__dirname, "..", "..", "..", ".env") });

import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // ← Required in v7 with adapters
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;   