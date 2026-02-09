# Tech stack capability research (2026-02)

This note summarizes current stack capabilities and practical contributor guidance. It is a planning reference, not a product policy source.

## Source and verification method

Version checks were based on:

- `package.json` in this repository
- npm metadata lookups run with `npm view <package> version`

## Version snapshot

| Stack element | Repo version | npm latest (checked) | Status |
| --- | --- | --- | --- |
| Astro | `^5.17.1` | `5.17.1` | current |
| `@astrojs/cloudflare` | `^12.6.12` | `12.6.12` | current |
| `@astrojs/react` | `^4.4.2` | `4.4.2` | current |
| React | `^19.2.4` | `19.2.4` | current |
| React DOM | `^19.2.4` | `19.2.4` | current |
| `@base-ui/react` | `^1.1.0` | `1.1.0` | current |
| TypeScript | `^5.9.3` | `5.9.3` | current |
| Wrangler | `^4.63.0` | `4.63.0` | current |

## What this means for contributors

- Major upgrades are not the immediate bottleneck.
- Reliability work should prioritize test depth, boundary checks, and docs alignment.
- Dependency changes should be justified by a clear safety, performance, or maintenance gain.

## Capability notes by layer

### Astro + Cloudflare adapter

- Strong server-first model for gated routes.
- Good fit for limiting client-side exposure of private data.
- Continue minimizing hydration for static or mostly-static UI.

### React 19

- Better ergonomics for async interactions and pending states.
- Use carefully: avoid shipping client-heavy patterns where server rendering is enough.

### TypeScript 5.9

- Stronger type workflows for validation and API boundaries.
- Continue reducing implicit `any` paths in shared helpers.

### Wrangler 4

- Mature Workers local/dev/deploy tooling.
- Keep environment variable and binding docs precise to reduce setup errors.

## Recommended near-term investments (non-version work)

1. Add tests for any new API endpoint at creation time.
2. Keep security-sensitive checks in shared helpers (`access`, `validation`, `rateLimit`).
3. Regularly prune stale docs that mention outdated package majors.
4. Keep release notes concise and explicit for security-relevant changes.

## Out of scope

- This doc does not authorize unsafe feature expansion.
- Product policy remains defined in `AGENTS.md`.
