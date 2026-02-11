# Security review checklist

Use this checklist for access, evidence, export, notice, and visibility changes.

## Access and gating

- Resident-only routes require valid building key checks.
- Steward actions require steward key checks.
- No reliance on unguessable URLs as the only control.

## Privacy and minimization

- No new required fields for names, email, phone, or unit number.
- Free text remains short and constrained.
- Small-count bucketing/suppression is preserved where applicable.

## Evidence handling

- Evidence remains private by default.
- No public evidence links or direct object-key leakage.
- File type and file size controls remain enforced.

## API and abuse controls

- Write paths remain rate-limited.
- Inputs stay enum/date/length validated.
- No new public write endpoint was introduced without controls.

## Tests and QA expectations

Run:

- `npm test`
- targeted tests for modified sensitive logic

Manual QA checklist for PR body:

- Can a non-auth user access a building page?
- Can evidence be accessed without a key?
- Are unit hints visible anywhere?
- Does “very simple English” contain idioms?
- Do counts leak identity when small?
