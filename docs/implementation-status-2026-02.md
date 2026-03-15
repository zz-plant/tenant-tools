# Implementation status and consolidated next steps (2026-02)

This is the single source for completed and pending implementation work for the current planning cycle.

## Completed since last planning pass

### Core safety and quality work

- [x] Share safety checklist now acts as a copy-link gate.
- [x] Public-readonly small-count suppression has regression coverage.
- [x] Evidence-upload warning copy includes required metadata reminders.
- [x] Very simple English copy-lint helper is in place.
- [x] Key-propagation integration coverage exists for dashboard and submission flows.

### Documentation and process tasks

- [x] PR template added to match policy requirements.
- [x] Testing guide added.
- [x] Security checklist added for release-time verification.

### Recently completed UI follow-up items

- [x] Intro panel now has one clear primary call-to-action.
- [x] Helper and metadata text contrast was increased for readability.
- [x] PR template now includes a visual QA checklist for CTA clarity, interaction states, and mobile readability.

## Remaining implementation priorities

### P1 — Consistency and maintainability

4. **Interaction-state consistency pass**
   - Standardize hover/active/focus/selected behavior across selectable cards and step controls.

5. **Color/surface token consolidation**
   - Replace repeated literal color values with semantic tokens.

6. **Spacing rhythm normalization**
   - Adopt and apply one spacing scale across the core pages.

## Explicitly out of scope

Do not add or prioritize:
- comments, chat, reactions, or forum patterns
- public write access
- identity-heavy auth requirements for MVP
- public evidence galleries
- legal-advice automation

## Notes for contributors

- Keep copy ESL-first and literal.
- Keep privacy protections and anti-retaliation defaults unchanged while doing UI cleanup.
- If roadmap items are completed, update this file in the same PR to avoid stale planning docs.
