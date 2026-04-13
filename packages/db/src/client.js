"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// packages/db/src/client.ts
const client_js_1 = require("../generated/prisma/client.js");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_js_1.PrismaClient({
        adapter, // ← Required in v7 with adapters
    });
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
//# sourceMappingURL=client.js.map