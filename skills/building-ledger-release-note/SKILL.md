---
name: building-ledger-release-note
description: Generate policy-aligned PR summary and changelog text for Building Ledger changes with required scope, security, and test sections.
---

# Building Ledger Release Note

Use this skill when preparing:

- pull request descriptions
- changelog entries
- release notes for user-visible workflow changes

## 1) Required inputs

Collect this information first:

1. Changed files and behavioral impact.
2. Security/privacy impact (access, evidence, identifiers, public/private exposure).
3. Tests run (exact commands and outcomes).
4. Scope boundaries (what was intentionally not included).

## 2) Output requirements

Always produce these sections in order:

1. Summary
2. Scope (Included / Not included)
3. Security and privacy notes
4. Test plan (Automated / Manual QA checklist)
5. Migration plan

Use short, literal language. No hype.

## 3) Guardrails

Do not claim:

- legal guarantees
- security guarantees that were not tested
- behavior changes that are not in changed files

If no migration is needed, write: `No migration required.`

## 4) Changelog format

For user workflow changes, emit concise entries with:

- `Added: ...`
- `Changed: ...`
- `Fixed: ...`
- `Security: ...`

Only include categories that apply.

## Reference

Use [references/pr-and-changelog-template.md](references/pr-and-changelog-template.md).
