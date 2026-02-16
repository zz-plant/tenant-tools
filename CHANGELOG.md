# Changelog

## 1.0.85 - 2026-02-16

### Changed

- Collapsed the preview area until step 1 is complete so first-time residents can focus on one required action before seeing copy/save tools.
- Added an explicit step-1 completion button and gated “Next” guidance so forward prompts appear only after basics are selected.
- Refined waitlist focus behavior with a dedicated focused-flow cue and simplified confirmation copy.
- Updated the no-timeline issue label for clearer punctuation and scan readability.

### Security

- Reduced accidental sharing risk by delaying visibility of copy and save actions until the required building and issue selections are complete.

## 1.0.84 - 2026-02-16

### Changed

- Refreshed the home intro layout with soft gradient accents, clearer feature cards, and stronger visual grouping for the first screen.
- Improved intro card styling and spacing so key actions are easier to scan on desktop while keeping compact mobile behavior.

### Security

- Kept privacy-first onboarding reminders explicit and unchanged while improving readability and visual hierarchy.

## 1.0.83 - 2026-02-16

### Changed

- Increased contrast for secondary action buttons to improve readability and click clarity in the builder and dashboard flows.
- Added a clear lock note on disabled step tabs so residents can see that later steps unlock after step 1 is complete.

### Security

- Kept resident-safe defaults unchanged while improving clarity around locked progression states and private workflow boundaries.

## 1.0.82 - 2026-02-15

### Changed

- Simplified builder step-1 helper copy by removing duplicate resident-key guidance and keeping one concise save-time reminder.
- Updated waitlist toggle and confirmation language to use clearer, action-based labels for first-time users.
- Corrected punctuation in the no-timeline issue option label for cleaner scan readability.

### Security

- Kept privacy-first wording explicit in onboarding and waitlist flows without introducing any new personal-data fields or public evidence behavior.

## 1.0.81 - 2026-02-14

### Added

- Extended the shared request guard to include centralized audit behavior for write endpoints, including rejected requests from failed auth, validation, or rate-limit checks.
- Added regression coverage that verifies blocked write attempts produce rejected audit entries.

### Changed

- Updated write routes to use guard-provided audit success logging so route handlers do not duplicate audit plumbing.
- Completed the modernization-plan transition by moving active roadmap references to `docs/priority-feature-roadmap-2026-02.md`.

### Fixed

- Ensured audit logging is part of the single request-guard layer rather than partially implemented in route handlers.

### Security

- Improved observability consistency for abuse and access-denied write attempts without storing direct personal identifiers.

## 1.0.80 - 2026-02-14

### Added

- Added a shared API request guard that centralizes auth scope checks, request validation, and rate-limit enforcement for submission and waitlist endpoints.
- Added privacy-preserving audit event storage for all write operations (submission create, status update, report increment, waitlist create).
- Added route-level audit regression coverage to verify every write path records an audit event.

### Changed

- Refactored submission and waitlist write handlers to call domain-layer record builders instead of embedding creation/update logic in route files.
- Updated read endpoints to use the same request guard flow for resident key checks and building-scope enforcement.

### Security

- Reduced risk of handlers accidentally skipping core access and abuse checks by routing API protection through one guard entry point.
- Expanded consistent audit traces for mutable operations while avoiding direct personal identifier fields in event payloads.

## 1.0.79 - 2026-02-13

### Changed

- Access key forms on building and record gate screens now use password-style fields with autocomplete disabled.
- Builder save confirmation now tells residents to open the link and then enter a building key.
- Cleaned gate-screen markup spacing after copy updates for clearer maintenance and review.

### Security

- Reduced shoulder-surfing and accidental key capture risk by masking key entry on gate forms.

## 1.0.78 - 2026-02-13

### Changed

- Submission creation now returns a permalink without embedding the resident key in the URL query string.
- Builder step 1 now explains early that a resident key is needed later only when saving a shared record.
- Access gate screens now direct residents to paste keys in the form instead of showing query-string key examples.

### Security

- Reduced accidental key leakage risk from copied permalinks and example URLs shown on gate screens.

## 1.0.77 - 2026-02-12

### Changed

- Updated core runtime dependencies to current patch/minor releases for Astro, Wrangler, Base UI, and React type support.
- Refreshed lockfile metadata to match the updated dependency graph used for local and CI installs.

### Security

- Keeps framework and tooling components on currently supported versions to reduce exposure to known issues fixed in newer releases.

## 1.0.76 - 2026-02-12

### Added

- Added shared navigation query helpers and tests to keep resident/steward key propagation consistent across dashboard links.
- Added regression tests for public-readonly small-count suppression formatting behavior.
- Added evidence warning copy tests to enforce required metadata safety terms.

### Changed

- Building dashboard now uses shared query helper utilities for link suffix and filter URL construction.
- Marked near-term TODO engineering and safety UX items complete now that related tests and helpers are in place.

### Security

- Reinforced anti-deanonymization safeguards with explicit regression checks for suppressed small counts.
- Reinforced evidence safety warning consistency with required-term assertions in tests.

## 1.0.75 - 2026-02-12

### Added

- Added a docs-only MCP prototype server with read-only `resources/list` and `resources/read` methods for allowlisted policy and skills files.
- Added maintenance MCP tool functions for `run_access_audit` and `validate_notice_copy` with deny-by-default behavior and warning-code outputs.
- Added tests for docs allowlist resource access and maintenance tool behavior.
- Added `npm run check:mcp-allowlist` to verify that the docs MCP allowlist stays in approved repo paths and points to existing files.
- Added documentation for running and validating the MCP prototype server.

### Security

- MCP docs access is now constrained to a fixed allowlist and rejects non-allowlisted resources.
- Maintenance audit helpers now return aggregate findings only and avoid raw private content output.

## 1.0.74 - 2026-02-12

### Added

- Added a copy-lint helper for very simple English notice text and tests that check simple templates for blocked idioms or pushy phrases.
- Added waitlist route and waitlist validation test coverage for payload errors, rate limits, and unit-hint rejection.
- Added request-key propagation tests for query and header key paths used across dashboard and submission flows.

### Changed

- Submission record page now buckets report counts using privacy-safe formatting and gates link copying behind completed share checks.
- Notice builder facts step now shows a unified evidence safety warning sentence before evidence notes.
- Evidence safety checklist wording now uses explicit "ID documents" language.

### Security

- Share flow now requires checklist confirmation before copy-link actions on the submission page.
- Small report counts on submission summaries now follow the same suppression pattern used elsewhere.

## 1.0.73 - 2026-02-11

### Changed

- Increased default text sizing, line spacing, and layout width constraints to make screens easier to read.
- Reworded key builder labels and helper copy so steps read like plain instructions instead of shorthand.
- Updated issue, summary, and notice preview typography to prioritize human readability over code-like presentation.

### Security

- Privacy reminders remain explicit while improving readability so residents can understand sharing cautions faster.

## 1.0.72 - 2026-02-11

### Added

- Preview now shows a privacy status strip to flag contact details and unit hints before sharing.
- Submission record page now includes a local “Before you share” checklist for names, unit numbers, and contact details.

### Changed

- Step 1 now keeps required choices first and moves location/stage into an optional setup section.
- Notice builder now shows explicit mobile Previous/Next step controls in addition to swipe.
- Dashboard copy now uses “records” language and explains that small counts are hidden for privacy.
- Stage and export audience cards now include helper descriptions for easier decisions.
- Reset action is now a tertiary clear action with confirmation to reduce accidental data loss.

### Security

- Early resident-key reminders now appear before save actions to reduce accidental unsaved private workflows.
- Privacy safety messaging is more consistent at preview and sharing points.

## 1.0.71 - 2026-02-10

### Changed

- Build config now accepts inferred deploy URLs (`CF_PAGES_URL`, `DEPLOY_PRIME_URL`, or `URL`) when `SITE_URL` is not set.

### Fixed

- Production builds no longer fail immediately when `SITE_URL` is missing in CI environments.

### Security

- Canonical and sitemap host warnings remain explicit when no site URL is available.

## 1.0.70 - 2026-02-10

### Added

- Notice builder now shows an **Open waitlist** jump link.
- Mobile step navigation now includes a hint to swipe and view all steps.

### Changed

- Access-gated building and submission pages now include an inline building key form.
- Residents can continue from gate screens without manually editing URL query text.

### Security

- Key gate screens keep the warning not to share resident keys in public channels.

## 1.0.69 - 2026-02-10

### Added

- Integration test coverage for steward status updates using header-based key auth.

### Changed

- Building dashboard no longer injects the steward key into inline page configuration.
- Steward controls now include a reminder to set issue status only after residents confirm the fix.

### Security

- Steward status updates now send `STEWARD_KEY` in the `x-steward-key` header instead of a URL query parameter.

## 1.0.68 - 2026-02-10

### Added

- Save-to-ledger now includes an inline building key field so residents can save without editing the URL manually.

### Changed

- Resident dashboard report counts now bucket values below 3 as `<3` to reduce small-count identity leakage.
- Waitlist invite downloads now use a neutral filename that does not include the building address.

## 1.0.67 - 2026-02-09

### Changed

- Combined the home intro and quick steps into one compact panel so the notice builder appears earlier on phones.
- Above-the-fold mobile content now uses short step chips to reduce vertical scrolling before the first form action.

## 1.0.66 - 2026-02-09

### Changed

- Phone layouts now use one-column issue and summary grids at small widths for easier reading and tapping.

### Fixed

- Removed forced text-size adjustment so mobile browsers can render readable default text sizing.

## 1.0.65 - 2026-02-09

### Added

- Viewport metadata now enables edge-to-edge rendering on mobile browsers.

### Changed

- Added safe-area support and dynamic viewport height handling to improve layout stability on iOS and Android.
- Sticky mobile step controls now clear bottom system bars by using safe-area bottom spacing.

## 1.0.64 - 2026-02-09

### Fixed

- Astro config no longer defaults `site` to `https://example.com`, preventing wrong canonical and OG origins when `SITE_URL` is unset.

### Security

- Production startup now fails fast if `SITE_URL` is missing so deployments cannot publish foreign canonical domains.

## 1.0.63 - 2026-02-09

### Added

- Shared SEO head component with canonical and social metadata support for page templates.
- Sitemap integration with filtering that excludes private resident routes.

### Changed

- Home page now includes static crawlable overview content before the interactive builder.

### Security

- Private building and submission pages now return noindex robots directives.

## 1.0.62 - 2026-02-07

### Changed

- Removed the extra intro panel to reduce repeated guidance text.
- Shortened quick-start, guided-action, and helper copy across the notice flow.
- Simplified top hero labels to keep focus on core actions.

## 1.0.61 - 2026-02-07

### Added

- One-click "Finish setup fast" action to jump from basics to preview with safe defaults.
- Basics checklist in step 1 so users can see required progress at a glance.

### Changed

- Very simple English now starts enabled by default to reduce setup decisions.
- Step 1 guidance now groups actions to reduce scan time.

## 1.0.60 - 2026-02-07

### Added

- Quick-start presets for first notice, follow-up, and final reminder to reduce setup effort.
- Guided "Next easiest step" action in step 1 to keep users moving through the flow.

### Changed

- Step 1 now includes clearer quick-start helper text and card styling for faster scanning.

## 1.0.59 - 2026-02-06

### Changed

- Upgraded core stack versions to Astro 5, Cloudflare adapter 12, React 19, TypeScript 5.9, and Wrangler 4.
- Updated React type packages to 19.x to match the runtime upgrade.

## 1.0.58 - 2026-02-04

### Changed

- Notice builder flow now confirms dates before optional facts and moves record/next steps into a dedicated section.

## 1.0.57 - 2026-02-04

### Changed

- Mobile layout now uses full-width actions, larger inputs, and clearer card spacing.

## 1.0.56 - 2026-02-04

### Changed

- Notice builder now locks later steps until basics are complete for a clearer flow.

## 1.0.55 - 2026-02-04

### Changed

- Simplified notice builder and waitlist copy to be shorter and more direct.

## 1.0.54 - 2026-02-04

### Changed

- Home page now highlights the quick steps, adds clear start actions, and stacks panels on mobile.

## 1.0.53 - 2026-02-04

### Changed

- Mobile view uses lighter panels, a scrollable step row, and a two-column issue grid to reduce scrolling.

## 1.0.52 - 2026-02-04

### Changed

- Mobile layouts now stack action buttons, widen tap targets, and tighten card spacing for easier phone use.

## 1.0.51 - 2026-02-04

### Changed

- Dashboard sidebar panels now use card styling for clearer filters and notes.

## 1.0.50 - 2026-02-04

### Changed

- Notice builder step header now shows a shorter privacy reminder and removes the quick-start cards to reduce visual clutter.

## 1.0.49 - 2026-02-04

### Changed

- Notice stage selection now uses clear card choices with a default-first hint.

## 1.0.48 - 2026-02-04

### Changed

- Notice builder removes organizer setup, similar issue prompts, 311 call details, plan goal prompts, and the Continuum contact panel to keep the flow focused.

## 1.0.47 - 2026-02-04

### Changed

- Notice builder steps are grouped into smaller sections to reduce overload.

## 1.0.46 - 2026-02-04

### Changed

- Waitlist steps are broken into a short sequence to reduce overload.

## 1.0.45 - 2026-02-04

### Changed

- Waitlist signup now uses progressive disclosure and only shows the invite text after saving.

## 1.0.44 - 2026-02-04

### Changed

- Waitlist signup no longer asks for a city to keep the form minimal.

## 1.0.43 - 2026-02-04

### Changed

- Notice builder steps now label required vs optional and add plain guidance for each step.

## 1.0.42 - 2026-02-04

### Changed

- Notice builder header no longer includes the tool-fit helper line to reduce clutter.

## 1.0.41 - 2026-02-04

### Changed

- Notice builder header now includes a compact tool-fit line to reduce quick-guide clutter.

## 1.0.40 - 2026-02-04

### Changed

- Tablet layout now stacks the main panels and tightens grid sizing for easier scanning.

## 1.0.39 - 2026-02-04

### Added

- Clearer privacy helper styling inside the disclosure card.

### Changed

- Privacy basics now use progressive disclosure to reduce early clutter.
- Mobile view hides extra hero tags and stacks progress details more cleanly.

## 1.0.38 - 2026-02-04

### Added

- Visual quick-guide icons and a progress pill in the notice builder header.

### Changed

- Organizer setup now uses progressive disclosure to reduce early load.
- Mobile layout stacks quick-guide cards and step metadata more cleanly.

## 1.0.37 - 2026-02-04

### Added

- Progress percent and “now/next” labels in the notice builder header.

### Changed

- Quick guide cards now group privacy basics and setup tasks more clearly.
- Hero tags remind users to share only with neighbors.

## 1.0.36 - 2026-02-04

### Added

- Step progress bar in the notice builder header.

### Changed

- Quick guide now uses a scannable card layout with clearer privacy notes.
- Hero tag row highlights private evidence handling.
- Calendar action label now reads as a reminder.

## 1.0.35 - 2026-02-02

### Added

- Inline notice stage helper text for first-time clarity.

### Changed

- Timeline and export panels now unlock after step 1 to reduce early overload.
- Sharing checklist now labels organizer-only setup tasks more clearly.
- Ledger save panel clarifies how to get a building key.
- Contact panel shows only for Continuum buildings.

## 1.0.34 - 2026-02-01

### Added

- Quick fact tags for common issue details to keep entries short.

### Changed

- Quick guide now includes a short “before sharing” checklist.
- Evidence safety checklist now reminds residents to remove location data when possible.
- Timeline steps now explain why a step is unlocked.

## 1.0.33 - 2026-01-30

### Changed

- Notice builder step labels now use action wording and add clearer plan/export helper copy.
- Access-gated pages add a more scannable key checklist and a reminder to verify links.
- Submission summary view reinforces the privacy review reminder.

## 1.0.32 - 2026-01-24

### Changed

- Notice builder emphasis now improves contrast and surfaces privacy reminders more clearly.
- Timeline, waitlist, and contact panels add clearer spacing and optional-field styling for readability.
- Footer safety reminder now has stronger contrast.

## 1.0.31 - 2026-01-24

### Changed

- Issue detail helpers now remind residents to keep short factual notes and avoid names or unit numbers.
- Evidence notes now restate that uploads are private by default.

## 1.0.30 - 2026-01-24

### Added

- Share readiness checklist and setup status callout before sharing with neighbors.

## 1.0.29 - 2026-01-24

### Added

- Waitlist inputs now enforce length limits and accessibility hints.

### Changed

- Notice builder inputs align with character limits and use simpler helper copy.
- 311 guidance and dashboard/submission copy now use shorter, clearer sentences.
- Home page metadata now matches Building Ledger branding.

## 1.0.28 - 2026-01-24

### Added

- Character limit guidance for issue detail fields to keep entries short.
- Export summary formatting snapshot coverage.

### Changed

- Export summary assembly now runs through a shared helper.

## 1.0.27 - 2026-01-24

### Changed

- Notice builder intro copy now emphasizes the first steps and shorter safety guidance.
- Access-gated pages add shorter instructions, example key placement, and a key-sharing warning.

## 1.0.26 - 2026-01-24

### Changed

- Notice builder now shows a privacy reminder near the step header.
- Access-gated pages add clearer next-step guidance and privacy context.

## 1.0.25 - 2026-01-24

### Changed

- Notice builder now highlights readiness status, clarifies the quick-start checklist, and aligns header copy with Building Ledger branding.
- Dashboard and submission access states now show step-by-step key instructions and clearer privacy notes.

## 1.0.24 - 2026-01-24

### Changed

- Submission summary warning now asks residents to review for names or unit numbers.

## 1.0.23 - 2026-01-24

### Changed

- Notice builder quick start now highlights the first step and adds a safety reminder.
- Building dashboard clarifies filter behavior and makes “Me too” the primary action.
- Submission details use a clearer list layout and restate the privacy reminder.

## 1.0.22 - 2026-01-24

### Added

- Skip-to-content links and a return link to the building dashboard for quicker navigation.

### Changed

- Step flow shows progress, disables forward actions until basics are set, and surfaces live status messages.

### Fixed

- Dashboard and similar-issue links now keep access keys, filters can be cleared, and empty dates show as “Not listed”.

## 1.0.21 - 2026-01-24

### Added

- Base UI primitives re-exported from `src/components/ui`.

### Changed

- Components now import Base UI primitives from shared UI index.

## 1.0.20 - 2026-01-24

### Added

- Evidence safety checklist before the evidence note field.
- Validation helper unit tests and sensitive-content coverage for evidence notes.

### Changed

- Building options now derive from configured building keys when available.
- Export summary now includes an issue status selector (open/resolved/archived).

### Fixed

- Management exports no longer list evidence notes when evidence is excluded.

### Security

- Evidence warnings now appear immediately before evidence notes.

## 1.0.19 - 2026-01-24

### Added

- Per-building access keys via `BUILDING_KEYS_JSON`.

### Changed

- Resident routes now require a valid building key for viewing and report-count updates.
- Notice templates no longer include unit or personal-name placeholders.

### Fixed

- Validation now blocks phone numbers, emails, and unit hints in saved fields.

### Security

- Submission permalinks now include the building key when saved from a keyed session.
