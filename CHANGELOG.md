# Changelog

## 1.0.26 - 2026-01-24

- Changed: Notice builder now shows a privacy reminder near the step header.
- Changed: Access-gated pages add clearer next-step guidance and privacy context.

## 1.0.25 - 2026-01-24

- Changed: Notice builder now highlights readiness status, clarifies the quick-start checklist, and aligns header copy with Building Ledger branding.
- Changed: Dashboard and submission access states now show step-by-step key instructions and clearer privacy notes.

## 1.0.24 - 2026-01-24

- Changed: Submission summary warning now asks residents to review for names or unit numbers.

## 1.0.23 - 2026-01-24

- Changed: Notice builder quick start now highlights the first step and adds a safety reminder.
- Changed: Building dashboard clarifies filter behavior and makes “Me too” the primary action.
- Changed: Submission details use a clearer list layout and restate the privacy reminder.

## 1.0.22 - 2026-01-24

- Added: Skip-to-content links and a return link to the building dashboard for quicker navigation.
- Changed: Step flow shows progress, disables forward actions until basics are set, and surfaces live status messages.
- Fixed: Dashboard and similar-issue links now keep access keys, filters can be cleared, and empty dates show as “Not listed”.

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
