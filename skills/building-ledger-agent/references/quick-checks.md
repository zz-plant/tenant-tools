# Quick checks

Use this list before committing.

## Safety and privacy

- No names, emails, phone numbers, or unit numbers added.
- Evidence remains private by default.
- No public write endpoints introduced.
- No comments/chat/reaction features introduced.

## Validation and abuse resistance

- Issue type remains enum-limited.
- Start date validation still enforced.
- Free-text limits still enforced where applicable.
- Write endpoints keep rate limiting.

## Copy quality (ESL-first)

- Short, literal sentences.
- No idioms, sarcasm, or metaphors.
- No intimidation language.
- “Next step” phrasing remains calm and procedural.

## QA pass

- Run `npm test`.
- For UI changes, review in browser and capture screenshot.
- For security-sensitive changes, verify gating with and without key.

## PR summary reminders

Include:

- summary of behavior changes
- explicit out-of-scope statement
- security/privacy notes
- test plan and results
- migration/env notes (if any)
