# Codebase audit and improvement plan (2026-09)

This document records a full audit of the repo before launch into a real building group chat.
It lists what works, what is broken, and a phased plan.

Scope: `src/`, `tests/`, config, and docs as of version 1.0.103.

---

## 1) Launch context (what we learned from the target group chat)

The first launch audience is a resident group chat for a mid-size rental building in Chicago.
The chat is a messaging-app "community" with several sub-groups (General, Announcements, Pets, Events, For Sale, Local Tips).
Notes below are generalized. No names, phone numbers, or unit numbers from the chat are stored in this repo.

### 1.1 What residents talk about

| Topic seen in chat | Fits an existing issue type? | Notes |
| --- | --- | --- |
| Door locks and key fobs stop working. Management asks residents to text a vendor to book a time. | Partly (`common`) | Access failure is urgent and affects many units at once. Needs fast "me too". |
| Spare fob requests refused or delayed for months. A fee is charged. | Partly (`building`) | A request with a clear date and repeat follow-ups. |
| Window cleaning not done. Residents ask about paying for it themselves. | Yes (`common`, `building`) | Classic "many residents, one request" case. |
| Paid amenity (parking) unavailable for weeks. Monthly charge not reduced. | Partly (`building`) | Residents asked about legal arguments. The app must stay out of legal advice. |
| Door-to-door energy supplier sign-ups. | No | Not a landlord repair issue. Out of scope. The chat handles this well already. |
| Residents have never met the manager. Messages go unanswered. | Yes (`no-timeline`) | A dated written record is the main value here. |
| "Could we all sign a petition?" | Yes (`building` + "me too") | This is the core use case: one notice, many residents, no names. |

### 1.2 How residents behave

- Everyone is on a phone. Links are shared inside the chat app.
- Display names often include unit numbers. Phone numbers are visible to every member.
- Messages mix facts with jokes, frustration, and comments about named staff.
- Messages written as `(773)555-0100` with no space after the area code are common.
- People react quickly and in bursts ("mine too", "same in my unit") within minutes of a problem.
- The chat may include people who are not residents (friends, residents of other buildings).

### 1.3 What this means for the product

1. **"Me too" is the main action.** It replaces the chat's "mine too" messages. It must be one tap, must not ask for a key again, and must not double count.
2. **The link posted to the chat must never contain the key.** The key should be shared once, in a quieter channel (for example the Announcements group or in person).
3. **Share text must be de-identified.** A "share to group" message should list issue type, start date, and a link only.
4. **Validation must catch the phone formats residents actually use.**
5. **Residents return many times from chat links.** A 30-minute key cookie forces re-entry too often.
6. **Structured facts are the value.** The chat already has emotion. The app gives the calm, dated record.
7. **The app must not name staff.** Some names were hardcoded in the repo (see 2.1).

---

## 2) Audit findings

Severity: **P0** = fix before launch. **P1** = fix soon after launch. **P2** = improvement.

### 2.1 Privacy and policy

| # | Sev | Finding | Where |
| --- | --- | --- | --- |
| A1 | P0 | Staff first names were hardcoded in a UI label ("Portfolio" option). This breaks AGENTS.md §1.2. The label also shows on record pages and exports. | `src/data/portfolioOptions.ts` |
| A2 | P0 | The phone regex misses `(773)555-0100` and `7735550100`. These are common formats. They pass validation and get saved. | `src/lib/validation/index.ts` |
| A3 | P1 | The name warning fires on any two capitalized words ("Water Leak", "Front Door"). Frequent false warnings teach people to ignore warnings. | `src/lib/validation/index.ts` |
| A4 | P2 | Resident and steward key checks use `===`. A constant-time compare is better practice. Risk is low because of rate limits. | `src/lib/access/index.ts` |

### 2.2 Correctness and UX bugs

| # | Sev | Finding | Where |
| --- | --- | --- | --- |
| B0 | P0 | The building dashboard crashed (HTTP 500) for every resident with a valid key. It called `Astro.resolve`, which Astro removed. Found by running the built app locally. | `src/pages/buildings/[id].astro` |
| B0b | P1 | "Start over" in the builder called four functions that no longer exist. It threw an error on every click. Found by the new type check. | `NoticeBuilder.tsx` |
| B1 | P0 | Middleware moves `?key=` into a cookie and removes it from the URL. The builder then reads `?key=` from the URL, which is now empty. Residents who opened a key link must type the key again to save. | `src/middleware.ts`, `NoticeBuilder.tsx` |
| B2 | P0 | "Me too" has no per-session check. One person can click again and again (up to 4 times each minute). Counts lose meaning. | `src/pages/api/submissions/[id]/report.ts` |
| B3 | P1 | Resident cookie lasts 30 minutes. Residents who return from chat links must enter the key again. There is no way to forget the key on a shared phone. | `src/middleware.ts` |
| B4 | P1 | "Me too" updates use read-modify-write on KV. Two taps at the same time can lose one update. KV has no atomic increment. | `report.ts` |
| B5 | P2 | `/api/submissions/similar` is not used by any page. It scans all records on each call. | `src/pages/api/submissions/similar.ts` |
| B6 | P2 | Access failures (door locks, fobs, window cleaning) have no quick-fact tags. Residents must type them. | `src/components/noticeBuilder/constants.ts` |

### 2.3 Performance and scale

| # | Sev | Finding | Where |
| --- | --- | --- | --- |
| C1 | P1 | The dashboard lists every record for every building. Then it reads each record one by one. That is N+1 KV reads for each page view. | `src/lib/buildingDashboard.ts` |
| C2 | P2 | KV list is eventually consistent. A new record can take up to 60 seconds to appear on the dashboard. | storage design |

### 2.4 Code health

| # | Sev | Finding | Where |
| --- | --- | --- | --- |
| D1 | P1 | No `tsconfig.json`. No type check runs. TypeScript errors are found only at build or runtime. | repo root |
| D2 | P1 | No CI workflow. Tests run only when a contributor remembers to run them. | `.github/` |
| D3 | P1 | `NoticeBuilder.tsx` is 1,600+ lines with 20+ `useState` calls. Hard to test and review. | `src/components/NoticeBuilder.tsx` |
| D4 | P2 | Submission shape is typed three times (record type, page-local type, dashboard type). | `lib/submissions.ts`, `pages/submissions/[id].astro`, `lib/buildingDashboard.ts` |
| D5 | P2 | Dashboard script sets colors with hex literals instead of CSS classes. | `src/scripts/buildingDashboard.ts` |
| D6 | P2 | `building-ledger-rules-pack.zip` is a committed binary with no documented source. | repo root |

### 2.5 Missing MVP features (from AGENTS.md §7)

| # | Sev | Finding |
| --- | --- | --- |
| E1 | P1 | Evidence upload is not implemented. There is only an "evidence note" text field. |
| E2 | P2 | Steward merge-duplicates is not implemented. |
| E3 | P2 | Print/PDF export layout is not implemented. Export is plain text only. |

### 2.6 What is already good

- Server-side gating on every resident page and API route.
- One request guard (`guardApiRequest`) for auth, validation, rate limits, and audit.
- Keys are removed from URLs by middleware, and cookies are `httpOnly`.
- Small counts are shown as `<3`.
- Sitemap excludes private routes. Private pages are `noindex`.
- Audit events store no IP address or session id.
- 63 unit tests pass. Production build passes.

---

## 3) Plan

### Phase 1: launch blockers (this PR)

| Item | Fixes |
| --- | --- |
| Fix the dashboard crash. Load the dashboard script with a bundled `<script>` import. | B0 |
| Remove the calls to missing functions in "Start over". | B0b |
| Remove staff names from portfolio labels. Keep stored ids unchanged. | A1 |
| Catch `(773)555-0100` and 10-digit phone formats. | A2 |
| Stop the name warning for common building words. | A3 |
| Builder uses the resident cookie session to save. Nobody has to type the key twice. | B1 |
| One "me too" per browser session per record. Store only a hash of the session id. | B2 |
| Resident cookie lasts 14 days. Add "Forget key on this device". | B3 |
| Dashboard reads KV list metadata. It skips reads for other buildings. Old records still work. | C1 |
| Add quick-fact tags for door fobs, locks, and window cleaning. | B6 |
| Add "Share in group chat" on the record page. The text has no key and no personal details. | Launch |
| Remove unused `similar` endpoint. | B5 |
| Add `tsconfig.json`, a `typecheck` script, and a CI workflow. Fix the ~40 type errors this found. | D1, D2 |
| Ignore `.dev.vars` and `.env` in git. The README tells contributors to put keys there. | Safety |

### Phase 2: after launch (next 2–4 weeks)

0. **Type-check `.astro` files.** `tsc` does not read `.astro` files. Add `@astrojs/check` and run `astro check` in CI.

1. **Atomic "me too" counts (B4).** Count "me too" rows by listing the `metoo:{id}:` prefix, or move counts to a Durable Object. This removes lost updates.
2. **Private evidence upload (E1).** Use R2 with no public bucket. Use random object keys with no building id. Strip EXIF in the browser before upload. Use short-lived signed URLs. Set a size limit and a file type allowlist. Show the upload warning from AGENTS.md §17.
3. **Split `NoticeBuilder.tsx` (D3).** Move state to a `useReducer` hook. Split each step into its own component: `IssueStep`, `DetailsStep`, `NoticeStep`, `ExportStep`. Add tests for the reducer.
4. **One submission type (D4).** Parse KV records with one `parseSubmissionRecord` helper and use it on every page.

### Phase 3: later

1. Steward merge-duplicates (E2).
2. Print/PDF export layout (E3).
3. Constant-time key compare (A4).
4. Review the rules pack zip (D6): document its source or remove it.
5. Per-building KV key prefix (for example `submission:{buildingHash}:{id}`) to remove full scans. Needs a data migration.

### Out of scope (by policy)

- Chat, comments, or reactions inside the app. The group chat already does this.
- Energy-supplier or scam alerts. These are not repair issues.
- Legal guidance on rent or fee credits (for example parking charges). The app can point to the renters' rights hotline and 311 as public info only.
- Naming the manager or management staff anywhere in the app.

---

## 4) Launch checklist for the group chat

1. Set `BUILDING_KEYS_JSON` and `STEWARD_KEY` in the deploy environment.
2. Share the building key once, in the Announcements group or in person. Do not post it in General.
3. Post the base link (no key) in General with one short line, for example:
   "Log building issues here. Tap Me too if it affects you. No names are saved."
4. When a new issue is saved, use "Share in group chat" on the record page. The message contains only the issue type, start date, and link.
5. Stewards update status only after residents confirm the fix.
