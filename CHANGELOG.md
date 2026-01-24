# Changelog

## 1.0.19 - 2026-01-24

- Added: Per-building access keys via `BUILDING_KEYS_JSON`.
- Changed: Resident routes now require a valid building key for viewing and report-count updates.
- Changed: Notice templates no longer include unit or personal-name placeholders.
- Fixed: Validation now blocks phone numbers, emails, and unit hints in saved fields.
- Security: Submission permalinks now include the building key when saved from a keyed session.
