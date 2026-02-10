# Testing guide

This project uses a small command set. Run these checks before you open a PR.

## Local command matrix

| Goal | Command | Expected result |
| --- | --- | --- |
| Run unit + integration tests | `npm test` | All tests pass. |
| Validate production build | `npm run build` | Build completes with no errors. |
| Local dev server | `npm run dev` | App runs locally for manual QA. |
| Preview production output | `npm run preview` | Built output is served for checks. |

## CI expectations

CI should run at least:

1. `npm test`
2. `npm run build`

A PR is not ready to merge if either command fails.

## Required coverage focus

When changes touch sensitive areas, include targeted tests:

- Access control and resident key gating
- Evidence upload/privacy controls
- Notice generator behavior
- Export generation
- Public/private mode restrictions

## Manual QA baseline

Use this baseline checklist for every user-facing change:

- Non-auth users cannot access resident-only building pages.
- Evidence is never publicly readable by default.
- Unit hints and identifying details are hidden where required.
- “Very simple English” copy remains short and literal.
- Small counts do not expose individual participation.
