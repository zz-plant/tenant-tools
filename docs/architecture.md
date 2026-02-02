# Architecture

This document describes how Building Ledger is structured and how data flows through the app.

## Stack overview

- **Framework:** Astro pages with React components for interactive UI. The main UI lives in `src/pages` and `src/components`.
- **Runtime:** Cloudflare Workers via `@astrojs/cloudflare`.
- **Storage:** Cloudflare KV namespaces for submissions and waitlist entries.

## Directory map

- `src/pages`: Route handlers and page templates.
  - `src/pages/index.astro`: Notice builder landing page.
  - `src/pages/buildings/[id].astro`: Resident dashboard for a building.
  - `src/pages/submissions/[id].astro`: Saved submission summary and timeline.
  - `src/pages/api/*`: JSON API endpoints.
- `src/components`: React UI components used by the pages.
- `src/lib`: Shared logic for access, validation, storage helpers, and rate limiting.
- `src/data`: Typed data and options used in forms and templates.

## Request flow

### Create a submission

1. The notice builder posts to `POST /api/submissions`.
2. The request is validated and sanitized in `validateSubmissionInput`.
3. The API enforces a resident access key and rate limits per IP.
4. A submission record is stored in `SUBMISSIONS_KV` with key `submission:{id}`.
5. The API responds with a permalink to `/submissions/{id}`.

### Add “me too” reports

1. The dashboard calls `POST /api/submissions/:id/report`.
2. The API validates the increment, confirms access key scope, and rate limits per IP.
3. The submission record is updated with the new report count.
4. A short-lived report entry is stored at `report:{submissionId}:{reportId}` for audit history.

### Update submission status

1. Steward actions call `POST /api/submissions/:id/status`.
2. The API validates the status enum and the steward key.
3. The submission record is updated in `SUBMISSIONS_KV`.

### Waitlist

1. The waitlist form posts to `POST /api/waitlist`.
2. The API validates the building and portfolio, then rate limits per IP.
3. Records are stored in `WAITLIST_KV` with key `waitlist:{id}`.

## Access control

- Building access uses a per-building key or a fallback key stored in environment variables.
- Pages that show resident data check the key before loading KV data.
- API routes check the key before writing to KV.
- Steward actions require a separate steward key.

## Validation and safety

- Submission input is validated for enums, dates, and limited-length detail fields.
- Optional detail fields are sanitized and checked for sensitive content.
- Waitlist input rejects unit numbers in building addresses.
- All write endpoints apply rate limits using `SUBMISSIONS_KV` or `WAITLIST_KV`.

## Storage layout (KV)

### Submissions

- `submission:{id}`: Full submission record.
- `report:{submissionId}:{reportId}`: Short-lived “me too” report entries (90-day TTL).

### Waitlist

- `waitlist:{id}`: Waitlist request record.

## Environment variables

- `SUBMISSIONS_KV`: KV namespace for submissions and reports.
- `WAITLIST_KV`: KV namespace for waitlist entries.
- `BUILDING_KEYS_JSON`: Per-building access keys (JSON map).
- `BUILDING_ACCESS_KEY`: Fallback key when a building is not listed.
- `STEWARD_KEY`: Key required for steward status updates.

