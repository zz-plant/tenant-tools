# Rules Pack

This directory contains structured rule data used by notice guidance and policy summaries.

## Purpose

- Keep jurisdiction-specific facts in versioned data files.
- Separate legal-process references from UI code.
- Make updates auditable and citation-backed.

## Layout

- `chicago/*` — city-level housing and notice rule references
- `cook/*` — county-level enforcement references
- `CHANGELOG.md` — rule-data change history

## Update process

When editing any rule file:

1. Update `last_reviewed`.
2. Verify and refresh `sources` URLs.
3. Keep wording factual and neutral.
4. Record meaningful changes in `CHANGELOG.md`.
5. Do not add personalized legal advice text.

## Data quality requirements

- Prefer plain, literal language.
- Avoid broad legal claims without source links.
- Keep values machine-readable for UI and export consumers.
- Preserve backwards compatibility for existing keys where feasible.

## Contributor note

If you change rule keys or schema shape, document migration impact in the PR summary and update consuming code/tests in the same PR.
