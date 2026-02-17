# Architecture

This document explains how Building Ledger is organized today, where safety checks happen, and which boundaries contributors must keep intact.

## Runtime and stack

- Astro `5.x` for routes/pages
- React `19.x` for interactive UI islands
- Cloudflare Workers runtime via `@astrojs/cloudflare`
- Cloudflare KV for submission persistence

Source of truth for versions: `package.json`.

## Repository map

- `src/pages`
  - Route pages (`index.astro`, `buildings/[id].astro`, `submissions/[id].astro`)
  - API handlers under `src/pages/api/*`
- `src/components`
  - React components used by pages
- `src/lib`
  - Access control (`src/lib/access`)
  - Validation (`src/lib/validation`)
  - Rate limiting (`src/lib/rateLimit.ts`)
  - Storage helpers (`src/lib/storage/*`)
  - Export/notice/submission helpers
- `src/data`
  - Static options, notice templates, and rules metadata
- `tests`
  - Node test suite for validation, access, status, export, and report flows

## Trust boundaries

### 1) Browser/UI boundary

UI should never be trusted for enforcement. Client checks are UX-only. Final checks must run on API handlers and gated server routes.

### 2) Access boundary

Resident pages and write endpoints require a resident building key. Steward operations require `STEWARD_KEY`.

### 3) Storage boundary

KV is treated as internal storage. Evidence metadata and submission records remain private unless explicit public-safe aggregation is implemented.

## Core request flows

### Submission creation

1. `POST /api/submissions`
2. Validate + sanitize input
3. Enforce access key and rate limit
4. Persist `submission:{id}` in `SUBMISSIONS_KV`
5. Return submission link (`/submissions/{id}`)

### “Me too” report increment

1. `POST /api/submissions/:id/report`
2. Validate input, key scope, and rate limit
3. Update report count on `submission:{id}`
4. Write audit entry `report:{submissionId}:{reportId}` (TTL)

### Status update (steward)

1. `POST /api/submissions/:id/status`
2. Validate status enum + steward key
3. Update `submission:{id}`

## Security and privacy controls

- Enum/date/length validation for structured inputs
- Sensitive-content warnings on optional free text
- IP/session rate limiting on write endpoints
- Resident-key gating on protected pages and APIs

## Environment variables

- `SUBMISSIONS_KV`
- `BUILDING_KEYS_JSON`
- `BUILDING_ACCESS_KEY`
- `STEWARD_KEY`

## Change guidance for contributors

When changing architecture-sensitive areas (`access`, `validation`, `storage`, `api`):

1. Keep enforcement server-side.
2. Reuse existing helper modules instead of duplicating checks.
3. Add or update tests for the touched boundary.
4. Re-check copy for ESL-first and neutral wording.
