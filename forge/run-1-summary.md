# Forge Run 1 — football-ai-platform (varodasi.com)

**Date:** 2026-04-08
**Agent:** Jarvis | claude-sonnet-4-6
**Source:** MASTER_ANALYSIS.md + SPRINT_PLAN.md (Sprint 1 & 2 priorities)
**Jira:** None

---

## Changes Made

### PR #18 — perf: remove full-table scan fallback in incidents slug lookup
**Branch:** `fix/incidents-slug-full-table-scan`
**Status:** Merged
**Files:** `src/app/api/incidents/route.ts`

**Problem:**
`GET /api/incidents?matchSlug=&incidentSlug=` fell back to `prisma.match.findMany(...)` — fetching ALL matches — when the slug DB lookup returned null. This was an O(n) full-table scan on every miss.

**Fix:**
- Removed the computed-slug fallback loop (was using `buildMatchSlug()` to compare all rows)
- `Match.slug` is an indexed unique column; if `findFirst({ where: { slug } })` returns null → 404 directly
- Also switched list response from `NO_CACHE_HEADERS` to `PUBLIC_CACHE_HEADERS` (`s-maxage=60, stale-while-revalidate=300`)
- Removed unused `buildMatchSlug` import

**Impact:** Eliminates DB N+1 pattern on incident detail lookups; CDN can now cache list responses.

---

### PR #19 — feat: add Zod validation to match-videos POST endpoint
**Branch:** `feat/match-videos-zod-validation`
**Status:** Merged
**Files:** `src/lib/schemas.ts`, `src/app/api/match-videos/route.ts`

**Problem:**
`POST /api/match-videos` had only a basic `if (!matchId || !videoUrl)` check with no type, length, or format validation. Invalid URLs, oversized strings, or invalid source values would pass through to Prisma.

**Fix:**
- Added `MatchVideoPostSchema` to `src/lib/schemas.ts`:
  - `matchId`: required string
  - `videoUrl`: required, URL format validated
  - `title`: optional, max 500 chars
  - `durationMin`: optional int, 0–600 range
  - `source`: enum `youtube | twitter | instagram | other`
  - `transcript` / `notes`: optional with length limits
- Replaced manual check with `parseBody(MatchVideoPostSchema, ...)` — consistent with existing pattern in comments, votes, suggestions routes

**Impact:** Prevents invalid data from reaching DB; consistent error response format across all write endpoints.

---

### PR #20 — perf: switch match-videos and var-events GET to PUBLIC_CACHE_HEADERS
**Branch:** `feat/cache-control-public-api-routes`
**Status:** Merged
**Files:** `src/app/api/match-videos/route.ts`, `src/app/api/var-events/route.ts`

**Problem:**
Both GET endpoints used `NO_CACHE_HEADERS` (`no-store, no-cache`) despite returning infrequently mutated, read-heavy data. Every request hit the DB with no CDN layer.

**Fix:**
- Switched success responses to `PUBLIC_CACHE_HEADERS` (`public, s-maxage=60, stale-while-revalidate=300`)
- Error responses remain `NO_CACHE_HEADERS`
- `PUBLIC_CACHE_HEADERS` was already defined in `lib/api-response.ts` and used by matches, referees, commentators, statistics routes — this restores consistency

**Impact:** CDN (Vercel Edge) caches these responses for 60s, serving stale content for up to 300s while revalidating. Reduces DB load on video/VAR stats pages.

---

## Analysis Source (MASTER_ANALYSIS.md top priorities addressed)

| Priority | Category | Status |
|----------|----------|--------|
| Sprint 2 #42 | perf — incidents slug full-table scan | Done (PR #18) |
| Sprint 1/2 #43 | arch/security — Zod input validation | Done (PR #19) |
| Sprint 2 #33 | perf — Cache-Control headers on GET routes | Done (PR #20) |

## Next Recommended Sprint 1 Tasks (not yet done)

| # | Task | Effort |
|---|------|--------|
| 6 | Growth — social share buttons (WhatsApp, X, Telegram) on all incident pages | S |
| 7 | Growth — dynamic OG image per incident (`opengraph-image.tsx`) | S |
| 8 | Analytics — Vercel Analytics `track()` custom events (vote, comment, view) | S |
| 17 | Accessibility — skip navigation link in `layout.tsx` | S |
| 18 | Accessibility — focus-visible indicators on all interactive elements | S |
