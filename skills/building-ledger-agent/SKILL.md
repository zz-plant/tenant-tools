---
name: building-ledger-agent
description: Guidance for working on the Building Ledger codebase with strict safety, privacy, and ESL-first copy requirements. Use when implementing or reviewing features, data validation, notice templates, access control, evidence handling, exports, or UI copy in this repo.
---

# Building Ledger Agent

## Overview
Use this skill when making changes to the Building Ledger app so updates stay safe, minimal, and consistent with resident privacy and ESL-first language.

## Workflow

### 1) Load repo rules and local conventions
- Open the nearest `AGENTS.md` that applies to the files you will touch. Follow all safety, privacy, and copy rules there.
- Prefer extending existing validation, gating, and storage helpers instead of adding new dependencies.

### 2) Classify the change (drives validation + tests)
- **Access control, evidence upload, notice generator, export, or public/private mode**: add unit/integration tests and update manual QA notes in the PR summary.
- **UI copy**: keep sentences short, literal, and ESL-first. Avoid idioms, threats, or legal advice.
- **Public exposure**: never make evidence public; suppress identifying details and small counts if public mode is involved.

### 3) Implement with safety-first defaults
- Minimize data collection (no names, emails, phone numbers, or unit numbers).
- Keep free text short and validated; prefer structured inputs.
- Keep escalation language calm (“next normal step”), not punitive.

### 4) Validate and document
- Run tests relevant to the change.
- If you changed user workflows, bump the version and add a changelog entry.
- Capture screenshots for meaningful visual UI changes.

## Reference quick checks
Use `references/quick-checks.md` when you need a fast safety + copy checklist before finalizing changes.
