# Main pages, templates, and components critique (2026-03, refresh)

## Scope

This critique covers the current main user surfaces after the latest UI copy/accessibility updates:

- Home page (`/`) + `NoticeBuilder`
- Building dashboard gate template (`/buildings/[id]` while key is missing/invalid)
- Submission record gate template (`/submissions/[id]` while key is missing/invalid)

## What is working well now

### 1) First action is clearer on home

- The hero no longer competes with a large duplicate CTA.
- The lead sentence points users directly to the builder below.
- The message stays short and factual.

Why this matters:

- It lowers decision overhead for first-time users.
- It keeps the flow “pick building + pick issue” as the primary action.

### 2) Stepper scan speed improved

- Short titles (`1. Basics`, `2. Dates`, `3. Details`, `4. Save`) are easier to scan.
- Locked-state messaging still explains what to do next.

Why this matters:

- This better supports ESL users and stressed users.

### 3) Gate templates are more concise and privacy-forward

- Building gate no longer duplicates “ask/paste/continue” guidance across both columns.
- Sidebar now explains privacy purpose, not repeated steps.
- Submission gate now explains the key-valid-but-link-invalid edge case in neutral language.

Why this matters:

- It reduces repeated text and likely confusion.

### 4) Action-state contrast is more legible

- Disabled and secondary buttons are easier to distinguish from inactive text blocks.

Why this matters:

- Better readability for low-vision and mobile/outdoor conditions.

## Constructive improvement opportunities (next pass)

### A) Home page: reduce vertical dead space below step 1

Observed:

- The first viewport can still feel long because the locked “Record and next steps” area appears immediately even when step 1 is incomplete.

Recommendation:

- Collapse the locked section into a one-line summary with a “Show section” control.
- Expand it only after step 1 is complete, or when the user explicitly opens it.

Expected benefit:

- Keeps early focus on completing required basics.

### B) Step cards: increase distinction between active and locked cards

Observed:

- Active vs locked step cards are visible but still close in tone on some displays.

Recommendation:

- Add a stronger active cue (left accent bar or thicker border).
- Keep locked cards lighter but maintain text contrast.

Expected benefit:

- Faster orientation for keyboard and touch users.

### C) Building gate: align error/help placement

Observed:

- “Key does not match this building” appears under the submit row, while safety warning appears lower and bold.

Recommendation:

- Group error + help + warning into a compact “Need help?” block directly under the form.
- Keep one error sentence, one recovery sentence, one safety sentence.

Expected benefit:

- Reduces eye travel and improves recovery flow.

### D) Submission gate: add one recovery action

Observed:

- Users get explanation text but only one navigation action (“Back to notice builder”).

Recommendation:

- Add a secondary recovery link such as “Back to building records” when building context exists.
- Keep it neutral and resident-only.

Expected benefit:

- Gives users a safer fallback path if a permalink is stale.

### E) Shared component consistency: heading rhythm

Observed:

- Panel heading and helper spacing differs between builder, building gate, and submission gate templates.

Recommendation:

- Apply a shared vertical spacing token for panel heading → helper → form rows.

Expected benefit:

- More predictable reading rhythm across templates.

## Suggested backlog order

1. Collapse or defer locked “Record and next steps” section on home until needed.
2. Strengthen active/locked visual distinction in the stepper.
3. Refine gate error/help grouping into a compact recovery block.
4. Add contextual fallback action on submission gate.
5. Normalize panel heading/helper spacing tokens across templates.

## Safety and scope check

- No recommendation requires adding personal identifiers.
- No recommendation requires public evidence access.
- No recommendation expands into comments/forums/social features.
- Recommendations keep copy neutral, factual, and non-threatening.
