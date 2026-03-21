# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
"Var Odası" (varodasi.com) — AI-powered Turkish football controversy detection platform built with Next.js 16, React 19, Prisma 7, PostgreSQL, and Tailwind CSS v4.

### Running the dev server
- `npm run dev` starts the Next.js dev server on port 3000.
- See `package.json` scripts for lint, build, and other commands.

### Database
- **PostgreSQL is required.** The Prisma schema uses `provider = "postgresql"` and the SQLite fallback in `src/database/db.ts` is incompatible with Prisma 7's adapter validation — it errors with `PrismaClientInitializationError`.
- Before first run, start PostgreSQL and create a database, then set `DATABASE_URL` in `.env` and run `DATABASE_URL=<url> npx prisma db push` to sync the schema. Note: `prisma.config.ts` falls back to a SQLite file URL when `DATABASE_URL` is unset, so the env var must be passed explicitly for Prisma CLI commands.
- The `postinstall` script runs `prisma generate` automatically on `npm install`.

### Authentication / Middleware
- The middleware (`src/middleware.ts`) protects `/dashboard` and write operations (POST/PUT/PATCH/DELETE) on API routes like `/api/matches`, `/api/incidents`.
- Admin access requires an `ADMIN_SECRET` env var and either a cookie `admin_token` or header `x-admin-token` matching that secret.
- A minimal `.env` needs: `DATABASE_URL`, `AUTH_SECRET`, and `ADMIN_SECRET`.

### Lint
- `npm run lint` runs ESLint 9. Pre-existing warnings/errors exist in the codebase (exit code 1).

### Optional services
- OpenAI (`OPENAI_API_KEY`): powers AI chat and incident detection; gracefully degrades without it.
- Qdrant (`QDRANT_URL`): vector similarity search; not needed for core app.
- Google OAuth, Reddit API, Supabase: optional integrations configured via env vars.
