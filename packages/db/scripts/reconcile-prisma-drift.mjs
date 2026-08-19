// One-time reconcile for dev databases created before the migration-history
// fixes (2026-08-19). Run once after pulling: `npm run prisma:reconcile`,
// then use `prisma migrate dev` / `migrate deploy` as usual.
//
// Fixes two historical quirks:
//  1. 20260816100000_sync_complaint_department_schema — the original
//     migration.sql was lost (only an empty file was ever committed) and was
//     recreated from the live schema diff. Databases that applied the ORIGINAL
//     file have a stale checksum -> migrate dev reports drift. We re-record
//     the migration's checksum from the restored file. Databases without the
//     record are left alone (fresh DBs replay the file normally).
//  2. complaint_embeddings (pgvector RAG table, managed at runtime by
//     apps/api/src/ai-triage/embedding.service.ts via @mastra/pg) was created
//     ad-hoc in the "public" schema, outside Prisma's knowledge -> "unknown
//     table" drift. Prisma now manages only schemas ["public"]; the table is
//     moved to the dedicated "embeddings" schema (data preserved).
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dotenv = readFileSync(join(root, ".env"), "utf8");
const urlMatch = dotenv.match(/^DATABASE_URL="?([^"\n]+)"?/m);
if (!urlMatch) {
  console.error("DATABASE_URL not found in packages/db/.env");
  process.exit(1);
}
const url = urlMatch[1];

const db = new Client({ connectionString: url });
await db.connect();

try {
  const SYNC = "20260816100000_sync_complaint_department_schema";

  // 1) checksum reconcile for the reconstructed sync migration
  const { rows } = await db.query(
    "SELECT 1 FROM _prisma_migrations WHERE migration_name = $1",
    [SYNC],
  );
  if (rows.length > 0) {
    console.log(`[1] ${SYNC}: re-recording as applied (new checksum)`);
    await db.query("DELETE FROM _prisma_migrations WHERE migration_name = $1", [
      SYNC,
    ]);
    execFileSync(
      "npx",
      ["prisma", "migrate", "resolve", "--applied", SYNC],
      { cwd: root, stdio: "inherit" },
    );
  } else {
    console.log(`[1] ${SYNC}: no record — nothing to do`);
  }

  // 2) move the runtime embedding table out of Prisma's managed schema
  const tbl = await db.query(
    "SELECT to_regclass('public.complaint_embeddings') AS t",
  );
  if (tbl.rows[0].t) {
    console.log("[2] moving complaint_embeddings -> embeddings schema");
    await db.query(`CREATE SCHEMA IF NOT EXISTS embeddings`);
    await db.query(`ALTER TABLE public.complaint_embeddings SET SCHEMA embeddings`);
  } else {
    console.log("[2] complaint_embeddings not in public — nothing to do");
  }
} finally {
  await db.end();
}

console.log("Done. Run `npx prisma migrate dev` — it should say 'Already in sync'.");