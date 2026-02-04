# Modernization plan

This plan outlines a site-wide re-architecture to modernize the stack while preserving the safety and privacy rules in this repo.

## Goals

- Keep resident data minimal and private.
- Separate access control, validation, and storage logic.
- Keep a small client bundle by limiting hydration.
- Make storage adapters interchangeable without changing UI code.

## Current stack summary

- **Framework:** Astro pages with React components for interactive UI. The main UI lives in `src/pages` and `src/components`.
- **Runtime:** Cloudflare Workers via `@astrojs/cloudflare`.
- **Storage:** Cloudflare KV namespaces for submissions and waitlist entries.

References:
- `docs/architecture.md`
- `package.json`

## Target-state milestones

### 1) Modular server layout

Move access control, validation, and storage into isolated modules so API routes call a single service layer.

Proposed layout:

- `src/lib/access/` for key checks and steward gating.
- `src/lib/validation/` for shared schemas and length limits.
- `src/lib/storage/` for KV and future adapters.

### 2) Shared validation schemas

Create shared schemas for submissions, reports, and waitlist requests. Enforce:

- Issue type enums
- Valid dates
- Short detail length limits
- Rejections or warnings for unit numbers and personal identifiers

### 3) Storage adapter interface

Add a `SubmissionStore` interface with adapters:

- `KvSubmissionStore` (current behavior)
- `D1SubmissionStore` (optional, controlled by env)

Keep rate limiting in KV for now.

### 4) Hydration audit

Limit client hydration to truly interactive components. Convert static components to server-rendered Astro where possible.

## Dependency upgrade matrix

| Package | Current | Target range | Notes |
| --- | --- | --- | --- |
| `astro` | `^4.15.0` | `^4.15.0` or `^4.x` latest | Keep aligned with `@astrojs/cloudflare` and `@astrojs/react`. |
| `@astrojs/cloudflare` | `^11.1.0` | `^11.x` latest | Confirm Worker runtime compatibility. |
| `@astrojs/react` | `^4.3.0` | `^4.x` latest | Match Astro 4 compatibility. |
| `react` | `^18.3.1` | `^18.x` latest | Keep with React 18 until React 19 migration plan exists. |
| `react-dom` | `^18.3.1` | `^18.x` latest | Match React version. |
| `@base-ui/react` | `^1.1.0` | `^1.x` latest | Validate bundle size and accessibility. |
| `typescript` | `^5.6.2` | `^5.6.x` latest | Keep in sync with `tsx`. |
| `tsx` | `^4.21.0` | `^4.x` latest | Confirm Node test compatibility. |
| `@types/react` | `^18.3.5` | `^18.3.x` latest | Keep with React 18 types. |
| `@types/react-dom` | `^18.3.0` | `^18.3.x` latest | Keep with React 18 types. |
| `tslib` | `^2.8.1` | `^2.x` latest | Standard runtime helper updates. |

## Safety checklist for the re-arch

- No public evidence access.
- No unit numbers shown in public mode.
- No forum or comment UI.
- No user identity collection.
- Keep UI copy short and literal.

## Rollout notes

- Make changes in small slices with tests.
- Add migration notes when data storage changes.
- Prefer opt-in flags for new storage backends.
