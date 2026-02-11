# Agent skills playbook (contributors)

This page explains which repo skill to use for common contribution tasks.

## Available repo skills

### `building-ledger-agent`

Use for general implementation and review tasks in this repository.

Best for:

- normal feature or fix work
- policy-aware contributor workflow
- final pre-PR quality pass

Path: `skills/building-ledger-agent/SKILL.md`

### `building-ledger-security-review`

Use when changes touch sensitive security or privacy behavior.

Trigger this for:

- access key checks and route gating
- evidence upload or evidence access behavior
- export behavior
- notice generator behavior
- public/private visibility logic

Path: `skills/building-ledger-security-review/SKILL.md`

### `building-ledger-copy-review`

Use when changes touch user-facing copy or templates.

Trigger this for:

- notice template text
- labels, helper text, warnings, and errors
- docs intended for residents or stewards

Path: `skills/building-ledger-copy-review/SKILL.md`

### `building-ledger-release-note`

Use when preparing PR descriptions or changelog entries.

Trigger this for:

- PR summary drafting
- scope and security notes drafting
- changelog entries for user-visible changes

Path: `skills/building-ledger-release-note/SKILL.md`

## Suggested sequencing

1. Start with `building-ledger-agent` for implementation context.
2. Add `building-ledger-security-review` if the change is security-sensitive.
3. Add `building-ledger-copy-review` if user-facing text changed.
4. Use `building-ledger-release-note` before final PR/changelog drafting.

## Notes

- Always follow `AGENTS.md` as the top policy document.
- If a change is both security-sensitive and copy-sensitive, use both specialized skills.
- Keep skill outputs concise and file-cited in PR notes where possible.
- In PRs, list which skills were used for review and final write-up.
