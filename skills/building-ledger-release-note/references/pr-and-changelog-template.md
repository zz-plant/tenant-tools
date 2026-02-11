# PR and changelog template

## PR body template

## Summary
- What changed?
- Why now?

## Scope
### Included
- Behavior/files/workflows included.

### Not included
- Explicitly deferred work.

## Security and privacy notes
- Data minimization impact.
- Access control impact.
- Evidence visibility impact.
- Abuse risk changes and mitigations.

## Test plan
### Automated
- List exact commands and outcomes.

### Manual QA checklist
- [ ] Non-auth users cannot access resident-only building pages.
- [ ] Evidence is never publicly readable by default.
- [ ] Unit hints and identifying details are hidden where required.
- [ ] “Very simple English” copy remains short and literal.
- [ ] Small counts do not expose individual participation.

## Migration plan
- Migration/rollout notes if needed.
- Else: `No migration required.`

## Changelog template

Added:
- ...

Changed:
- ...

Fixed:
- ...

Security:
- ...
