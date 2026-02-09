---
name: building-ledger-agent
description: Contributor and review guidance for Building Ledger with strict safety, privacy, and ESL-first copy requirements.
---

# Building Ledger Agent

Use this skill for implementation, review, or documentation updates in this repo.

## 1) Required first step

Read the applicable [`AGENTS.md`](../../AGENTS.md) before editing files. Treat it as binding policy for:

- safety and abuse prevention
- privacy and data minimization
- ESL-first copy style
- out-of-scope feature boundaries

## 2) Change classification

Classify your task before coding. This determines required validation.

### Security-sensitive changes

Includes:

- access control / gating
- evidence handling
- notice generator behavior
- export behavior
- public/private visibility mode

Required:

- tests for touched checks
- explicit security/privacy notes in PR summary
- manual QA checklist in PR summary

### Copy/UI-only changes

Required:

- short, literal, non-idiomatic language
- no threats, accusations, or legal-advice framing
- screenshot for meaningful visual changes

## 3) Implementation rules

- Reuse existing helpers in `src/lib/access`, `src/lib/validation`, and `src/lib/storage`.
- Keep free text constrained and validated.
- Keep evidence private by default.
- Do not introduce identity collection fields unless explicitly approved.
- Avoid adding dependencies unless needed and justified.

## 4) Validation routine

Minimum before submitting:

1. Run `npm test`.
2. Run targeted checks for changed behavior (if applicable).
3. Verify docs are still accurate when behavior/config changed.

## 5) Finalization checklist

- [ ] No new personal identifiers collected
- [ ] No public evidence access introduced
- [ ] No forum/comment mechanics introduced
- [ ] ESL-first copy preserved
- [ ] Changelog updated for user-visible changes

## Reference

Use `references/quick-checks.md` for a compact pre-PR safety and quality pass.
