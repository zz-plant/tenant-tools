# Modernization plan

This plan tracks contributor-facing modernization work while keeping Building Ledger safety constraints intact.

## Objectives

- Keep privacy and anti-retaliation controls strict during refactors.
- Reduce maintenance cost by standardizing validation, access, and storage patterns.
- Improve contributor onboarding and release safety.
- Keep the app fast on low-bandwidth mobile devices.

## Current baseline

The repo already runs on current major tooling (Astro 5, React 19, TypeScript 5.9, Wrangler 4). Modernization focus is now on **engineering consistency and operational safety**, not framework migration.

## 2026 workstreams

### A) Guardrail consolidation

- Keep access checks centralized in `src/lib/access`.
- Keep input validation centralized in `src/lib/validation`.
- Document required checks for new write endpoints.
- Add tests whenever new API handlers are introduced.

### B) Storage abstraction hardening

- Continue using KV as default.
- Keep storage helpers under `src/lib/storage/*` with stable interfaces.
- If a new adapter is introduced (e.g., D1), gate it behind explicit environment flags and parity tests.

### C) Documentation modernization

- Keep `README.md` as the contributor entry point.
- Keep architecture docs aligned with real file paths.
- Keep agent skill docs aligned with `AGENTS.md` requirements.
- Maintain explicit “what is out of scope” language to prevent unsafe feature creep.

### D) Quality gates

- Run `npm test` before every merge.
- Expand integration coverage for:
  - access control
  - status updates
  - report increments
  - export assembly
- Add visual checks/screenshots for meaningful UI behavior changes.

### E) Release hygiene

- Continue semantic version updates in `package.json` for shipped changes.
- Add concise changelog entries (`Added`, `Changed`, `Fixed`, `Security`).
- Note operational or env changes in PR summaries.

## Safety checklist for every modernization PR

- No new personal data collection
- No public evidence exposure
- No unit-number leakage in public surfaces
- No comments/forum features
- No legal-advice claims
- ESL-first, neutral copy

## Deferred items (explicitly not in this cycle)

- Authentication systems that require identity collection
- Public write APIs
- Social engagement mechanics (comments, likes, reactions)
- Legal strategy automation

## Exit criteria for this plan

This modernization cycle can be considered complete when:

1. Access/validation/storage patterns are consistently reused.
2. Core security-sensitive paths have stable test coverage.
3. Contributor and agent docs remain accurate and easy to follow.
4. Release notes consistently capture user-visible and security-relevant changes.
