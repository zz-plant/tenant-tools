# Tech stack capability research (2026-02)

This note captures newer capabilities in the current stack and how they may help Building Ledger while preserving privacy and safety constraints.

## Scope and method

- Read current dependency versions from `package.json`.
- Queried npm for latest package versions with:
  - `npm view astro version`
  - `npm view @astrojs/cloudflare version`
  - `npm view @astrojs/react version`
  - `npm view react version`
  - `npm view react-dom version`
  - `npm view @base-ui/react version`
  - `npm view typescript version`
  - `npm view wrangler version`

## Version snapshot

| Stack element | Current in repo | Latest on npm (2026-02 check) | Upgrade signal |
| --- | --- | --- | --- |
| Astro | `^5.17.1` | `5.17.1` | Current |
| `@astrojs/cloudflare` | `^12.6.12` | `12.6.12` | Current |
| `@astrojs/react` | `^4.4.2` | `4.4.2` | Current |
| React | `^19.2.4` | `19.2.4` | Current |
| React DOM | `^19.2.4` | `19.2.4` | Current |
| `@base-ui/react` | `^1.1.0` | `1.1.0` | Already current |
| TypeScript | `^5.9.3` | `5.9.3` | Current |
| Wrangler | `^4.63.0` | `4.63.0` | Current |

## Newer capability opportunities to evaluate

These are high-value capabilities to review during upgrade planning.

### 1) Astro 5 + Cloudflare adapter 12

Potential capabilities:
- Better server/runtime alignment for modern Cloudflare Worker deployments.
- Improvements in island rendering and server-first patterns that can keep client JavaScript smaller.
- Better fit for route-level server logic in `src/pages/api/*` while keeping strict access controls.

Why it matters here:
- Smaller bundles and server-first rendering are aligned with mobile-first resident usage.
- Better server integration can simplify resident-key gating paths and reduce accidental client exposure.

### 2) React 19

Potential capabilities:
- New form/action patterns that can simplify write flows and pending states.
- Improved async rendering ergonomics for optimistic updates and loading UI.
- Better hydration/runtime behavior in mixed server/client apps.

Why it matters here:
- Could reduce custom state code in notice and submission flows.
- Can improve reliability for low-bandwidth users during submit/report actions.

### 3) TypeScript 5.9

Potential capabilities:
- Improved type-checking performance and editor responsiveness.
- Newer type-system improvements that reduce unsafe implicit paths.
- Better support for modern module/tooling workflows.

Why it matters here:
- Faster feedback on validation and access-control code paths.
- Helps keep input constraints strict (issue enum/date/detail limits).

### 4) Wrangler 4

Potential capabilities:
- Updated local dev and deploy ergonomics for Workers.
- Better compatibility with recent Cloudflare platform features.
- Improved operational controls for environment bindings.

Why it matters here:
- Easier validation of KV bindings and access-key environment setup.
- Can tighten deployment confidence for resident-only routes.

## Safety-first adoption checklist

Before adopting any major version:

1. Confirm private mode gating still blocks unauthorized building access.
2. Confirm evidence endpoints remain private and not publicly enumerable.
3. Confirm public mode (if used) still suppresses small counts and free-text.
4. Re-run validation tests for issue type enum, valid start date, and short details.
5. Re-check copy style in UI strings (ESL-first, neutral, no threats).

## Suggested phased plan

- Phase 1: Patch/minor updates (`@astrojs/react`, TypeScript) with full test run.
- Phase 2: Astro 5 + `@astrojs/cloudflare` 12 upgrade in one branch with integration checks.
- Phase 3: React 19 migration spike with focused component compatibility tests.
- Phase 4: Wrangler 4 upgrade after deploy pipeline validation.

## Out-of-scope in this research note

- Core dependency upgrades were applied in version 1.0.59.
- No production behavior changes were made.
- No schema or API contract changes were made.
