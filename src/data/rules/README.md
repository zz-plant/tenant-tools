# Rules Pack

This folder contains versionable, citation-backed rule configuration used by Building Ledger.

## Layout
- `rules/chicago/*` — Chicago-specific rules (heat, RLTO summary pointer, deposit interest rates)
- `rules/cook/*` — Cook County rules (eviction execution authority)

## Updating
When updating any rule:
1. Update `last_reviewed`
2. Add/adjust `sources` URLs
3. If the rule changed, add an entry to `CHANGELOG.md`
