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
3. Require a session id (`bl_session_id` cookie, set by middleware)
4. Check `metoo:{submissionId}:{sha256(submissionId:sessionId)}`. If present, return the current count with `alreadyReported: true`
5. Update report count on `submission:{id}` and write the `metoo:` marker (TTL)
6. Write audit entry `report:{submissionId}:{reportId}` (TTL)

### Storage layout

KV (`SUBMISSIONS_KV`):

| Key | Value |
| --- | --- |
| `submission:{id}` | Full record. List metadata holds a summary. |
| `bidx:{buildingHash}:{id}` | Per-building index. Empty value. List metadata holds a summary. |
| `bidx-ready:{buildingHash}` | Set after older records for the building are copied into the index. |
| `metoo:{id}:{sha256(id:sessionId)}` | One "me too" per browser session per record. No TTL. |
| `evidence:{id}:{evidenceId}` | Evidence metadata: random object key, type, size, date. |
| `report:*`, `audit:*`, `rate:*` | Report log, audit events, and rate limits (all with TTL). |

`buildingHash` is a one-way hash, so no key shows a street address.
All stored records are read through `parseSubmissionRecord` in `src/lib/submissions.ts`.

R2 (`EVIDENCE_BUCKET`): `ev/{uuid}` holds stripped image bytes. The bucket is never public.

### Dashboard listing

1. Hash the building id.
2. If `bidx-ready:{hash}` exists, list `bidx:{hash}:` and build rows from list metadata (no per-record reads).
3. Otherwise scan `submission:` once, write index entries for this building, and set `bidx-ready:{hash}`.

### "Me too" counts

KV has no atomic increment. The count is rebuilt from `baseReportCount + mergedReportCount + number of metoo markers`.
Concurrent taps each write their own marker, so none are lost. A stale stored count heals on the next tap or on a record page view.

### Steward merge

`POST /api/submissions/:id/merge` with `{ "into": "<main id>" }`, steward key required.
Same building only. The duplicate becomes `archived` with `mergedInto`. Its report count moves to `mergedReportCount` on the main record.

### Evidence upload and viewing

1. The browser re-encodes the photo on a canvas (drops EXIF), then `POST /api/submissions/:id/evidence` with the image bytes.
2. The server checks the resident key and building, rate limit, type (`image/jpeg` or `image/png`) by magic bytes, and 5 MB limit.
3. The server strips metadata again, stores the bytes at `ev/{uuid}` in R2, and saves `evidence:{id}:{evidenceId}`.
4. `GET /api/submissions/:id/evidence` returns signed links (5-minute expiry) to residents of the building.
5. `GET /api/submissions/:id/evidence/:evidenceId?exp&sig` needs a valid signature and the resident key. Responses are `private, no-store` with `nosniff` and a sandbox CSP.
6. `DELETE` on the same path is steward-only.

### Export

`/buildings/:id/export` is a print view for inspectors and legal aid. It shows issue type, start date, days open, bucketed counts, 311 ticket, and evidence count. It leaves out free text, zones, evidence files, and merged duplicates.

### Resident session

Middleware moves `?key=` into the httpOnly `bl_resident_key` cookie (14 days) and removes it from the URL.
`?forget=1` clears the resident and steward cookies.
The builder gets only the building ids the cookie unlocks, never the key.

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
- `EVIDENCE_BUCKET` (R2 binding, optional)
- `EVIDENCE_SIGNING_KEY` (secret, optional)

## Change guidance for contributors

When changing architecture-sensitive areas (`access`, `validation`, `storage`, `api`):

1. Keep enforcement server-side.
2. Reuse existing helper modules instead of duplicating checks.
3. Add or update tests for the touched boundary.
4. Re-check copy for ESL-first and neutral wording.
