# Changelog

## 1.0.49 - 2026-02-04

- Changed: Notice stage selection now uses clear card choices with a default-first hint.

## 1.0.48 - 2026-02-04

- Changed: Notice builder removes organizer setup, similar issue prompts, 311 call details, plan goal prompts, and the Continuum contact panel to keep the flow focused.

## 1.0.47 - 2026-02-04

- Changed: Notice builder steps are grouped into smaller sections to reduce overload.

## 1.0.46 - 2026-02-04

- Changed: Waitlist steps are broken into a short sequence to reduce overload.

## 1.0.45 - 2026-02-04

- Changed: Waitlist signup now uses progressive disclosure and only shows the invite text after saving.

## 1.0.44 - 2026-02-04

- Changed: Waitlist signup no longer asks for a city to keep the form minimal.

## 1.0.43 - 2026-02-04

- Changed: Notice builder steps now label required vs optional and add plain guidance for each step.

## 1.0.42 - 2026-02-04

- Changed: Notice builder header no longer includes the tool-fit helper line to reduce clutter.

## 1.0.41 - 2026-02-04

- Changed: Notice builder header now includes a compact tool-fit line to reduce quick-guide clutter.

## 1.0.40 - 2026-02-04

- Changed: Tablet layout now stacks the main panels and tightens grid sizing for easier scanning.

## 1.0.39 - 2026-02-04

- Changed: Privacy basics now use progressive disclosure to reduce early clutter.
- Changed: Mobile view hides extra hero tags and stacks progress details more cleanly.
- Added: Clearer privacy helper styling inside the disclosure card.

## 1.0.38 - 2026-02-04

- Added: Visual quick-guide icons and a progress pill in the notice builder header.
- Changed: Organizer setup now uses progressive disclosure to reduce early load.
- Changed: Mobile layout stacks quick-guide cards and step metadata more cleanly.

## 1.0.37 - 2026-02-04

- Added: Progress percent and “now/next” labels in the notice builder header.
- Changed: Quick guide cards now group privacy basics and setup tasks more clearly.
- Changed: Hero tags remind users to share only with neighbors.

## 1.0.36 - 2026-02-04

- Added: Step progress bar in the notice builder header.
- Changed: Quick guide now uses a scannable card layout with clearer privacy notes.
- Changed: Hero tag row highlights private evidence handling.
- Changed: Calendar action label now reads as a reminder.

## 1.0.35 - 2026-02-02

- Added: Inline notice stage helper text for first-time clarity.
- Changed: Timeline and export panels now unlock after step 1 to reduce early overload.
- Changed: Sharing checklist now labels organizer-only setup tasks more clearly.
- Changed: Ledger save panel clarifies how to get a building key.
- Changed: Contact panel shows only for Continuum buildings.

## 1.0.34 - 2026-02-01

- Added: Quick fact tags for common issue details to keep entries short.
- Changed: Quick guide now includes a short “before sharing” checklist.
- Changed: Evidence safety checklist now reminds residents to remove location data when possible.
- Changed: Timeline steps now explain why a step is unlocked.

## 1.0.33 - 2026-01-30

- Changed: Notice builder step labels now use action wording and add clearer plan/export helper copy.
- Changed: Access-gated pages add a more scannable key checklist and a reminder to verify links.
- Changed: Submission summary view reinforces the privacy review reminder.

## 1.0.32 - 2026-01-24

- Changed: Notice builder emphasis now improves contrast and surfaces privacy reminders more clearly.
- Changed: Timeline, waitlist, and contact panels add clearer spacing and optional-field styling for readability.
- Changed: Footer safety reminder now has stronger contrast.

## 1.0.31 - 2026-01-24

- Changed: Issue detail helpers now remind residents to keep short factual notes and avoid names or unit numbers.
- Changed: Evidence notes now restate that uploads are private by default.

## 1.0.30 - 2026-01-24

- Added: Share readiness checklist and setup status callout before sharing with neighbors.

## 1.0.29 - 2026-01-24

- Added: Waitlist inputs now enforce length limits and accessibility hints.
- Changed: Notice builder inputs align with character limits and use simpler helper copy.
- Changed: 311 guidance and dashboard/submission copy now use shorter, clearer sentences.
- Changed: Home page metadata now matches Building Ledger branding.

## 1.0.28 - 2026-01-24

- Added: Character limit guidance for issue detail fields to keep entries short.
- Added: Export summary formatting snapshot coverage.
- Changed: Export summary assembly now runs through a shared helper.

## 1.0.27 - 2026-01-24

- Changed: Notice builder intro copy now emphasizes the first steps and shorter safety guidance.
- Changed: Access-gated pages add shorter instructions, example key placement, and a key-sharing warning.

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
