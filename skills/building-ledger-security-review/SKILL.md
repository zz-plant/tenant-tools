---
name: building-ledger-security-review
description: Security and privacy review workflow for Building Ledger changes that touch access, evidence, export, notice, or visibility controls.
---

# Building Ledger Security Review

Use this skill when a change touches any sensitive flow:

- access control or resident key gating
- evidence upload, retrieval, or storage behavior
- notice generator behavior
- export generation
- public/private visibility rules

## 1) Required policy read

Before review, read [`AGENTS.md`](../../AGENTS.md) and treat it as binding.

## 2) Review steps

1. Identify changed files and classify risk.
2. Validate constraints using `references/security-review-checklist.md`.
3. Run required checks:
   - `npm test`
   - any targeted tests for changed behavior
4. Confirm PR summary includes:
   - security/privacy notes
   - explicit out-of-scope scope
   - manual QA checklist answers

## 3) Non-negotiable fail conditions

Reject or request changes if any of these are introduced:

- personal identifier collection by default
- public evidence access
- public write paths that bypass gating
- missing validation for sensitive inputs
- missing tests for touched security checks

## 4) Output format for review comments

Use this compact structure:

- **Risk level:** low / medium / high
- **Findings:** bullet list with file paths
- **Required fixes:** bullet list
- **Optional hardening:** bullet list
- **Validation run:** commands and pass/fail notes

## Reference

Use [references/security-review-checklist.md](references/security-review-checklist.md).
