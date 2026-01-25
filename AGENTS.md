# AGENTS.md — Building Ledger

This file defines how AI agents (and humans using AI) should work in this repo:
- what you are allowed to do
- what you must not do
- how to implement safely (privacy, abuse resistance)
- how to propose changes (scope, review, tests)
- how to write copy (ESL-first, facts-only)
- how to avoid turning this into a retaliation or doxxing tool

If you are an agent: treat this file as **binding**.

---

## 0) Project Summary (for agents)

**Building Ledger** is a lightweight web app that helps residents:
- log building issues with minimal input
- add “me too” participation without writing
- upload evidence (privately) attached to issues
- generate neutral repair notices
- export summaries (PDF/print) for inspectors/legal aid

**It is not a forum.**  
**It is not legal advice.**  
**It is not a public shaming platform.**

Primary design constraints:
- protect vulnerable users (first-time renters, immigrants/ESL, stressed/angry residents)
- minimize collected personal data
- structure communication so users don’t need to “sound official”
- prevent misuse (doxxing, retaliation, defamation)

---

## 1) Agent Operating Rules

### 1.1 Always optimize for:
1) **Safety** (privacy, retaliation risk, doxxing prevention)  
2) **Simplicity** (few inputs, clear actions, low cognitive load)  
3) **Factuality** (observable conditions, timestamps, counts)  
4) **Procedural usefulness** (templates, timelines, exports)

### 1.2 Never add:
- discussion threads, comments, reactions, “hot takes”
- features that encourage naming individuals
- features that publish evidence publicly by default
- features that require real names, emails, or unit numbers
- dark patterns, engagement loops, notifications-as-pressure

### 1.3 If a request conflicts with safety:
- refuse the change
- propose a safer alternative
- document the risk in the PR description

---

## 2) Threat Model & Abuse Cases (must consider)

When designing or implementing anything, assume:
- management/landlords may try to view or scrape the site
- trolls may attempt to spam, harass, or doxx
- residents may upload sensitive documents accidentally
- residents may write defamatory statements if given free text
- small numbers (e.g., “1 affected”) can deanonymize

### Must explicitly protect against:
- **Doxxing**: unit numbers, faces, mail labels, names, phone numbers
- **Retaliation**: publicly identifiable reporting patterns
- **Defamation**: accusations of criminality or illegality without verification
- **Surveillance**: landlord reading resident-only content
- **Spam**: public write endpoints, scraping

---

## 3) Privacy & Data Minimization Policy (non-negotiable)

### 3.1 Data we should NOT collect (default)
- full names
- emails or phone numbers
- precise unit numbers (publicly visible)
- employment details, immigration status, ID documents
- long narrative descriptions

### 3.2 Data we CAN collect (MVP)
- issue type (enum)
- start date (date)
- status (open/resolved/archived)
- “me too” count (reports)
- optional short factual detail (very short, enforced limit)
- optional “zone”/area (common area / hallway / unit / unknown)
- evidence files (private)

### 3.3 Sessions & identity
- Prefer anonymous session IDs scoped to a building.
- Avoid login in MVP.
- If introducing authentication later, it must be optional and not required for basic participation.

### 3.4 Evidence handling
- Evidence is **private by default**.
- Evidence must never be publicly viewable in “public mode”.
- Strip EXIF/metadata on upload if possible.
- Show warnings before upload: “Do not upload faces, names, mail labels, leases.”

---

## 4) Public vs Private Mode Requirements

### Private mode (default)
- Access gated (resident key or equivalent)
- Full issue details allowed (still minimal)
- Evidence gallery allowed
- Notice generator allowed
- Exports allowed

### Public mode (optional)
Public mode must:
- be read-only
- hide evidence files (show “evidence on file” count only)
- hide unit hints and precise locations
- bucket or suppress small counts (e.g., do not show counts < 3)
- remove free-text entirely or render only curated “factual tags”
- include a disclaimer: “Resident-reported. Not verified.”

**Agents may not implement public mode unless all above constraints are enforced.**

---

## 5) Copy Standards (ESL-first, non-idiomatic)

All user-facing copy must be:
- short sentences
- no idioms (“circle back”, “touch base”, “heads up”, “squeaky wheel”)
- no sarcasm
- no metaphors
- no legal intimidation language
- no moral judgments

### Notice generator requirements
- Provide templates in two levels:
  - Standard
  - Very simple English
- Always include:
  - what happened
  - start date
  - request for repair plan / timeline
- Do not include accusations or threats.
- “Next step” language should be framed as:
  - “The next normal step is…”
  - not “Escalate / threaten”

---

## 6) Escalation UX Rules

### 6.1 Escalation cues are “unlockable”
- Do not show all steps at once.
- Unlock based on:
  - time open
  - # affected
  - presence of essential service category
  - presence of external ticket number (optional field)

### 6.2 Avoid “pressuring” language
Use:
- “Next normal step”
- “You can now send a follow-up”
- “This issue qualifies for a 311 inspection”

Avoid:
- “Force them”
- “Make them pay”
- “Punish the landlord”
- “Name and shame”

### 6.3 No legal advice claims
We can provide:
- general process steps
- neutral templates
- public info about calling 311
We must not provide:
- personalized legal guidance framed as advice
- instructions to break the law
- instructions to withhold rent without procedural warnings

---

## 7) Product Scope Boundaries (MVP)

### MVP includes
- building page (gated)
- issue creation (structured)
- issue list + filters
- issue detail
- “me too”
- evidence upload (private)
- notice generator (heat/leaks/pests/entry)
- steward mode (resolve/merge/export)
- export view (print/PDF layout)
- basic rate limiting + abuse controls

### MVP does NOT include
- chat/comments
- notifications
- social graph
- landlord directory / “reviews”
- money handling
- legal advice engine
- public evidence galleries

Agents should push back on scope creep.

---

## 8) Repository Conventions (adapt to your stack)

> If this repo does not yet have the structure below, agents may propose it, but must not invent tooling without checking existing code.

Typical structure:

/app or /src        - frontend routes and UI /server or /api     - backend handlers / API routes /db                 - schema, migrations, seed /docs               - non-code documentation /scripts            - maintenance tasks

### Naming conventions
- Use descriptive names: `IssueCard`, `EvidenceGrid`, `NoticeGenerator`.
- Avoid cleverness.

### Code style
- Prefer TypeScript types over implicit `any`.
- Keep components small and testable.
- Treat security checks (gating, validation) as first-class.

---

## 9) Validation & Constraints (must implement)

### Required input validation
- Issue type must be from enum.
- Start date must be a valid date.
- Optional detail must be length-limited (e.g., 200 chars).
- Rate-limit writes per IP/session.

### Content constraints
If any free-text exists:
- enforce max length
- reject/strip:
  - names of individuals (hard problem; at least warn)
  - profanity (optional)
  - “illegal”, “fraud”, “scam” (consider soft warning rather than block)
- Prefer removing free-text entirely over imperfect moderation.

---

## 10) Security Requirements

### Access control
- Resident-only pages must require a building access key or equivalent mechanism.
- Do not rely on obscurity (unguessable URLs alone).

### Abuse resistance
- Add bot protection on write endpoints (CAPTCHA/Turnstile optional).
- Rate-limit per IP and per session.
- Reject large file uploads; enforce file type allowlist.

### Evidence storage
- Signed URLs for private content.
- No public bucket.
- No direct object keys that reveal building ID or address.

---

## 11) Testing & QA Expectations

### Minimum tests for any PR touching:
- access control
- evidence upload
- notice generator
- export generation
- public/private mode

Add at least:
- unit tests for validation logic
- integration tests for gating and permission checks
- snapshot/visual checks for export formatting (if available)

Manual QA checklist (must include in PR):
- Can a non-auth user access a building page?
- Can evidence be accessed without a key?
- Are unit hints visible anywhere?
- Does “very simple English” contain idioms?
- Do counts leak identity when small?

---

## 12) PR / Change Management

### PR template (agents must follow)
Include:
- Summary
- Scope (what is intentionally not included)
- Screenshots (UI changes)
- Security/privacy notes
- Test plan
- Migration plan (if schema changes)

### Commit messages
- `feat: ...`, `fix: ...`, `chore: ...`
- Keep commits small.

### Breaking changes
If changing schema or behavior:
- add migration steps
- add feature flags if needed
- preserve backward compatibility when feasible

---

## 13) “Steward” Role Guidelines

Steward is not “admin power”; it’s housekeeping.

Steward can:
- merge duplicates
- mark resolved/archived
- generate exports
- hide obviously unsafe content

Steward cannot:
- edit resident reports to change meaning
- see private unit hints if those are meant to be hidden (unless explicitly designed)
- access resident identity information beyond minimal session metadata

---

## 14) Localization & Accessibility

### Language support
- MVP: English + “Very simple English”
- If adding languages:
  - use professional translation or community-reviewed translations
  - do not rely on machine translation without review for legal/tenant contexts

### Accessibility
- Keyboard navigable forms
- High-contrast mode where possible
- Mobile-first layouts for uploads and templates

---

## 15) Guidance for AI Agents Generating Content

When producing:
- templates
- UI copy
- documentation

Agents must:
- keep language literal and neutral
- include placeholders rather than invented addresses/names
- avoid legal claims like “this guarantees…” or “you are entitled to X” without citation in docs
- separate “info” from “action” clearly

If uncertain, prefer:
- “You can consider…”
- “A common next step is…”

---

## 16) “Stop Conditions” (when to halt and ask)

Agents should pause and request guidance if:
- asked to make evidence public
- asked to collect user identity
- asked to enable public write access
- asked to add comments/forums
- asked to add features that name landlords or individuals
- asked to generate legal advice tailored to a specific dispute

Offer safer alternatives (resident-only, exports, minimization).

---

## 17) Default UI Safety Warnings (recommended)

### Evidence upload warning
> Do not upload photos with faces, mail labels, unit numbers, leases, or anything with your name.

### Free-text warning (if any)
> Write only observable facts. Do not include names. Keep it short.

### Public mode warning (if supported)
> Public mode hides evidence and identifying details. Public write access is disabled.

---

## 18) Implementation Notes for “Modern” Agent Workflows

If you are using a coding agent:
- Always inspect existing files before creating new ones.
- Prefer extending existing utilities (validation, storage, gating).
- Avoid introducing new dependencies without justification.
- Document any new environment variables.

Recommended agent workflow:
1) Read repo structure
2) Identify existing patterns (routing, auth, storage)
3) Implement smallest slice
4) Add tests
5) Run lint + tests
6) Provide PR-ready summary

---

## 19) Versioning & Releases

When shipping changes that affect user workflows:
- bump version
- include a short changelog entry:
  - “Added: …”
  - “Changed: …”
  - “Fixed: …”
  - “Security: …”

---

## 20) Quick Reference (agent checklist)

Before finalizing a change, confirm:

- [ ] No personal identifiers required
- [ ] No evidence publicly accessible
- [ ] No unit numbers displayed in public mode
- [ ] No forum/comment UI added
- [ ] Copy is ESL-first and non-idiomatic
- [ ] Escalation is “unlock-based,” not pushy
- [ ] Rate limiting / abuse controls considered
- [ ] Tests and manual QA checklist included

---

## 21) AGENTS.md Best Practices (for maintainers)

Use these practices when you update this file.

### 21.1 Structure and scope
- Keep a clear table of sections and numbers.
- Keep each section focused on one topic.
- State the scope for each instruction. Example: “applies to UI copy only.”
- Put higher priority rules earlier in the document.

### 21.2 Clarity and format
- Use short sentences.
- Use plain words. Avoid jargon.
- Use “must / must not / should / may” for rules.
- Provide examples for risky areas (privacy, public mode).
- Keep lists short and readable.

### 21.3 Change management
- Record the reason for a change in the PR summary.
- Note any new risks in the PR security section.
- Keep changes small when possible.
- Do not change two unrelated policies in one PR.

### 21.4 Consistency checks
- Check for conflicts between sections.
- Keep terms consistent (example: “public mode”).
- Ensure new rules match the project summary and threat model.

### 21.5 Maintenance
- Remove outdated rules when the product changes.
- Keep examples accurate and safe.
- Keep copy ESL-first and non-idiomatic.

---

## Appendix A — Canonical Enums (suggested)

Issue types (MVP):
- `heat`
- `water_leak`
- `pests`
- `entry_access`
- `elevator_common`
- `noise_construction`
- `other`

Status:
- `open`
- `resolved`
- `archived`

Visibility mode:
- `private`
- `public_readonly`

---

## Appendix B — Notice Templates (requirements summary)

Each issue type must support:
- Initial notice
- Follow-up notice
- Final “next step” notice (calm)

Each notice must exist in:
- Standard English
- Very simple English

No threats. No insults. No speculation. Dates included.

---

If you are an agent and you disagree with any part of this document,
open an issue proposing changes and include:
- the risk you’re addressing
- the safer alternative
- how it preserves the project’s constraints
