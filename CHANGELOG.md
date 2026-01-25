# Changelog

## 1.0.21 - 2026-01-24

- Added: Base UI primitives re-exported from `src/components/ui`.
- Changed: Components now import Base UI primitives from shared UI index.

## 1.0.20 - 2026-01-24

- Added: Evidence safety checklist before the evidence note field.
- Added: Validation helper unit tests and sensitive-content coverage for evidence notes.
- Changed: Building options now derive from configured building keys when available.
- Changed: Export summary now includes an issue status selector (open/resolved/archived).
- Fixed: Management exports no longer list evidence notes when evidence is excluded.
- Security: Evidence warnings now appear immediately before evidence notes.

## 1.0.19 - 2026-01-24

- Added: Per-building access keys via `BUILDING_KEYS_JSON`.
- Changed: Resident routes now require a valid building key for viewing and report-count updates.
- Changed: Notice templates no longer include unit or personal-name placeholders.
- Fixed: Validation now blocks phone numbers, emails, and unit hints in saved fields.
- Security: Submission permalinks now include the building key when saved from a keyed session.
