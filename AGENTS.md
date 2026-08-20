# AGENTS.md — Menofia Governorate Complaints Management System

Rebuild of a legacy Microsoft Access–based complaints tracker ("sys_2025") for Menofia Governorate officials. Arabic-first UI; officials log, route, resolve, and report on citizen complaints with AI-assisted intake/triage. Read **Operate** before touching commands, **Build constraints** before product decisions.

## Repo layout

npm-workspaces monorepo (no Turborepo/Nx). Run workspace scripts with `npm run <script> -w <pkg>`; root `package.json` fans out the common ones (`dev`, `build`, `typecheck`, `test`, `prisma:*`, `bruno:*`).

| Path | What |
|---|---|
| `apps/api` | NestJS backend (`@complaints/api`). Prisma client + Mastra AI live here as modules: `ai-triage`, `ai-summarization`, `auth`, `complaints`, `departments`, `intake`, `letters`, `social`, `reporting`, `settings`, `users`, `profile`, … |
| `apps/web` | React + Vite + Tailwind 4 frontend, SPA (`vercel.json` rewrites all to `/index.html`) |
| `packages/db` | **All Prisma lives here** (not `apps/api`): `prisma/schema.prisma`, `prisma.config.ts`, `prisma/migrations`, `prisma/seed.ts`, `scripts/reconcile-prisma-drift.mjs` |
| `packages/types` | Shared DTOs/enums consumed as `@complaints/types: "*"` by both apps. Re-export Prisma-derived types through here; don't import the Prisma client into `apps/web`. |

## Operate

### Dev servers
- API: `npm run dev` (Nest `--watch`, port 3000). Requires `apps/api/.env` — copy `apps/api/.env.example`.
- Web: `npm run web` (Vite, port 5173). API CORS allows only `localhost:5173`.
- DB: `docker compose up -d` → Postgres on `localhost:5432` (`postgres/postgres`, db `complaints`, container **`complaints-db`**, `pgvector/pg18` image). Ad-hoc SQL: `docker exec complaints-db psql -U postgres -d complaints`.

### Verify / test (in the order CI does it)
1. `npm run prisma:generate` — after any schema change, or the API typecheck/runtime is stale.
2. `npx prisma migrate deploy` (in `packages/db`) — what CI/shared DBs use (not `migrate dev`).
3. `npx tsx prisma/seed.ts` (in `packages/db`) — idempotent seed. **Seeded logins: `admin/admin123`, `superadmin/superadmin123`.**
4. `npm run typecheck` — API only (`tsc --noEmit`); web typechecks implicitly in its build (`tsc -b && vite build`).
5. `npm run build` — `nest build`; runs locally from `node apps/api/dist/main`.
6. `npm test` — jest unit tests in `apps/api`, `*.spec.ts` co-located with source, `tsconfig.spec.json`.
7. `npm run bruno:test` — Bruno API integration suite (`apps/api/bruno`); requires the API running on :3000. CI runs it last.

CI: `.github/workflows/ci.yml` — Node 22, `pgvector/pgvector:0.8.5-pg18` service, DB `complaints_test`.

### Prisma — the sharp edges (root cause of past drift pain)
- **Prisma 7, multiSchema.** The schema datasource block has **no `url`** — it comes from `packages/db/prisma.config.ts` (`DATABASE_URL` from `packages/db/.env`). `shadowDatabaseUrl` is **required** by `migrate dev` (env `SHADOW_DATABASE_URL`, else local `complaints_shadow` fallback).
- Datasource declares `schemas = ["public"]` and every model/enum has `@@schema("public")`. Only `public` is Prisma-managed. Two schemas are in play:
  - `public` — Prisma-managed. Any new table must arrive via a migration; **never raw SQL** (ad-hoc tables in `public` are the #1 drift source).
  - `embeddings` — runtime-owned by `@mastra/pg` (PgVector config in `apps/api/src/ai-triage/embedding.service.ts` → `schemaName: 'embeddings'`). Table `complaint_embeddings` (pgvector + ivfflat), created/dropped at runtime with the embedding model's dimension. **Do not move it back to `public`** — Prisma can't model ivfflat and drift returns.
- Migrations: `npm run prisma:migrate` = `prisma migrate dev` (local dev only). On a drifted DB, `migrate dev` offers a **reset** — never accept blindly; it wipes the dev data (`~27k` complaints). Reconcile or deploy instead.
- After pulling a fresh history, teammates only need this once: `npm run prisma:reconcile` (in `packages/db`) — re-records the checksum of the reconstructed `20260816100000_sync_complaint_department_schema` migration and moves a stray `complaint_embeddings` out of `public` (see `scripts/reconcile-prisma-drift.mjs`). It's idempotent and leaves fresh DBs alone.
- **Fixing a drifted dev/shared DB (manual, verified Aug 2026).** Do this when `prisma migrate status` shows drift/an unapplied migration that isn't in the repo, or when the reconcile script can't run. In `packages/db`, with the API's Postgres accessible (`docker exec complaints-db psql -U postgres -d complaints`):
  1. Reconstruct the missing migration SQL from the live schema diff — write it into the migration folder that has a `_prisma_migrations` record but no `migration.sql` (Needs `shadowDatabaseUrl`, already in `prisma.config.ts`):
     `npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url "$SHADOW_DATABASE_URL" --script > prisma/migrations/20260816100000_sync_complaint_department_schema/migration.sql`
  2. Re-record the stale checksum: `DELETE FROM _prisma_migrations WHERE migration_name = '20260816100000_sync_complaint_department_schema';` then `npx prisma migrate resolve --applied 20260816100000_sync_complaint_department_schema` (in `packages/db`).
  3. Move any stray runtime table out of `public`: `CREATE SCHEMA IF NOT EXISTS embeddings; ALTER TABLE complaint_embeddings SET SCHEMA embeddings;` (if `metadata` has NULLs where the column is NOT NULL, backfill/`SET NOT NULL` after).
  4. Verify: `npx prisma migrate status` → "up to date", then `npx prisma migrate dev` → "Already in sync". Never raw-create tables in `public`, never move `complaint_embeddings` back to `public`.

### API (NestJS) notes
- Global prefix `/api`; `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` — **extra fields in request bodies are rejected**; update DTOs rather than sending undocumented fields.
- Uploads are served statically from the repo-root `uploads/` dir under `/uploads` (that dir is gitignored); no S3/MinIO.
- AI is env-driven (`EMBEDDING_MODEL`, `LLM_MODEL`, `OPENAI_API_KEY`, …) — see `apps/api/.env.example`.

### Web app notes
- Vite dev serves the SPA fallback for any missing path under the public dir from first load. After editing anything in `apps/web/public/` (e.g. `presentation/*.png`), **restart the dev server** or images will come back blank/stale.
- In-app presentation deck: `/present` route in `apps/web/src/pages/presentation/` — `slides.tsx` (content), `registry.ts` (slide order), `index.tsx` (route).

### Docs / PDF pipeline (`docs/` gets special treatment)
- `docs/` is **gitignored**, yet `docs/DOCUMENTATION.pdf` + `docs/USER-GUIDE.pdf` are tracked (force-added). New/changed files under `docs/` need `git add -f` — plain `git add` silently skips them.
- `docs/pdf/build-pdf-typst.mjs`: markdown → typst → PDF using `docs/pdf/bin/typst`. Flags: `--md <file>` (default `docs/DOCUMENTATION-v2.md`), `--no-images`, `--no-screenshots`, `--skip-mermaid`. Arabic docs auto-detect (RTL + Noto Sans Arabic cover); `**bold**` is rewritten to `#strong[...]` — keep markdown bold syntax in sources.
- `docs/slides/capture-presentation.mjs`: screenshots the `/present` deck (needs the web dev server on :5173; `--no-zoom` → native 1920×1080) → `docs/slides/slides-to-pdf.mjs` / `photos-to-pdf.mjs` export the presentation PDFs.

## Build constraints that still hold

Product decisions, not suggestions — keep them unless explicitly reversed:

- **Arabic-first, RTL.** Build with `dir="rtl"` in mind (mirrored nav, forms, tables).
- **Roles: three** — `Official` (موظف), `Admin` (مدير), `SuperAdmin` (مدير عام) per the `UserRole` enum; see the roles table in `docs/USER-GUIDE.md` for exactly what each can do. The department filter is a convenience filter, **not** an access boundary; no per-department permission model.
- **Status colors:** green = Finished/Low severity, amber = Medium/Pending, red = High severity/Overdue — consistent across all screens.
- Complaint → **one primary department/authority** only.
- `examinationStatus` is the real granular workflow field (legacy lookup values). "Finished/Not Finished" is a **derived grouping**, never stored as a second status field.
- Uploads are local files via the `ComplaintFile` model under `/uploads` — not S3/MinIO, not raw string paths.
- **AI must be human-in-the-loop:** AI drafts summaries/reports/letters; a human reviews/approves before anything is finalized or sent. Severity is Low/Medium/High (no numeric scale) and **overridable by officials**. Recurrence: structured match (National ID + category + location) first, AI text-similarity as a fallback signal. No AI fine-tuning/correction-learning loops.

## Explicitly out of scope (don't build unless asked)

Citizen-facing portal · historical data migration · multi-department complaint ownership · per-department accounts or scoped permissions · more than the three existing roles (Official/Admin/SuperAdmin) · live real-time dashboards · scraping without genuine account access (Facebook via official Graph API only) · AI fine-tuning loop · numeric severity scores · legacy aid-committee and vehicle-request subsystems · auto-notifications/escalation (overdue = visual flag only).

## Design references note

Early design docs (`stitch.md`, `LEGACY_SCHEMA_ANALYSIS.md`) that this project once referenced are **no longer in the repo** — do not hunt for them; treat the constraints above and current code as authoritative.