# Three Designs to Rethink (2026-02)

This note selects three high-impact design areas to rethink next.

Selection criteria:
- resident safety first
- lower user effort
- clearer factual workflow
- lower retaliation and doxxing risk

## 1) Rethink where resident-key entry appears

### Current pattern
Resident-key input appears early in the flow, before users finish writing a notice.

### Problem
Early key prompts can feel like a blocker.
A first-time user may stop before they finish the core task.

### Better direction
Keep only a short awareness line in step 1.
Move full resident-key input to the save/share area.

Suggested copy:
> You can write your notice now. You need the resident key only to save a shared record.

### Why this should be first
It reduces early friction and keeps the first step focused.
It also keeps access control intact, because save still requires a key.

---

## 2) Rethink share safety from advisory text to action gate

### Current pattern
A share checklist appears before sharing, but the checklist is advisory.

### Problem
Users can still copy a link without confirming privacy checks.
That increases accidental sharing risk.

### Better direction
Make checklist checks required before enabling “Copy link.”
Keep the gate local and lightweight.
Do not add pressure language.

Suggested checklist line update:
- Replace “I removed contact details” with “I removed phone numbers and email addresses.”

### Why this should be second
This is the highest-risk point for privacy mistakes.
A small gate can prevent doxxing and retaliation exposure.

---

## 3) Rethink destructive reset placement near save/export actions

### Current pattern
“Clear form and start over” is near save/export controls.

### Problem
Dense action areas increase accidental destructive clicks.
Users can lose work during a stressful task.

### Better direction
Move reset into a secondary “More actions” section.
Keep a confirmation prompt.
Use plain warning copy with no idioms.

### Why this should be third
This is a low-complexity change with immediate usability benefits.
It protects effort and lowers frustration without changing product scope.

---

## Scope guardrails for these changes

- No new comments, chat, or public write flows.
- No extra identity collection.
- No public evidence exposure.
- Keep copy ESL-first, short, and literal.

## Quick validation checklist

- User can complete initial drafting without entering a key.
- Copy link stays disabled until all privacy checks are complete.
- Reset action is visually secondary and confirm-protected.
- No new personal data fields are introduced.
