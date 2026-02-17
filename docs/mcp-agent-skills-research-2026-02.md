# MCP and Agent Skills research for Building Ledger (2026-02)

This note summarizes how AI developers are using MCP and Agent Skills, then maps that to safe, practical options for this repository.

It is a contributor planning note. It is not product policy.

## Sources reviewed

- Model Context Protocol introduction and docs navigation (`modelcontextprotocol.io`)
- Claude Code skills documentation (`docs.anthropic.com`)
- Agent Skills overview and adoption page (`agentskills.io`)
- Awesome MCP Servers ecosystem index (`github.com/punkpeye/awesome-mcp-servers`)
- Existing repo docs and skill (`README.md`, `AGENTS.md`, `skills/building-ledger-agent/SKILL.md`)

## What AI developers are doing with MCP right now

### 1) Standardizing tool access across agents

MCP is being used as a common protocol to connect models to files, APIs, databases, and action tools. Teams use it as an abstraction layer so one tool integration can work across multiple MCP-compatible clients.

Common pattern:

- expose internal data or actions through MCP servers
- connect multiple clients (IDE agent, CLI agent, chat assistant)
- keep business logic in the server rather than in prompts

### 2) Building focused MCP servers, not one giant server

The ecosystem trend is many narrow servers (GitHub, DB, browser, docs, Figma, etc.) instead of one monolithic connector. This improves access control and makes tool failures easier to isolate.

### 3) Treating MCP like an internal platform boundary

In mature teams, MCP is becoming a policy boundary:

- auth at server boundary
- explicit allowlists for actions
- strong audit logs for tool calls
- scoped secrets per server

This makes agent behavior more reviewable than ad-hoc shell scripting.

### 4) Combining MCP with guardrails and workflow control

Developers are layering MCP with:

- rate limits
- write confirmations for risky actions
- environment segmentation (read-only in dev/review, restricted writes in CI)

This is relevant for safety-sensitive apps where mistakes can leak private data.

## What AI developers are doing with Agent Skills right now

### 1) Encoding team workflow as reusable skill folders

Skills are being used to package:

- instructions (`SKILL.md`)
- references/examples
- scripts for repeatable checks

This reduces repeated prompt-writing and helps contributors follow the same playbook.

### 2) Separating "reference" skills from "task" skills

A common setup:

- reference skills: always-available conventions/policies
- task skills: explicit commands for side-effecting workflows (deploy/release/migration)

### 3) Restricting automatic invocation for risky skills

Teams disable model auto-invocation for operations with side effects (deploy, production DB actions, incident paging). Skills remain available, but require explicit user action.

### 4) Using skills as cross-tool portability layer

The open Agent Skills format is being adopted across multiple coding/agent tools. Teams are using that portability so governance instructions do not live in one vendor-specific prompt system.

## Implications for Building Ledger

Building Ledger has strict privacy/safety requirements. MCP and skills can help contributors move faster **if** they are used to reinforce policy, not bypass it.

## Recommended implementation options for this repo

### Option A (low risk, high value): expand skill coverage in-repo

Target users: contributors and coding agents working inside this repository.

Proposed additions under `skills/`:

1. `skills/building-ledger-security-review/`
   - checklist for access/evidence/public-mode changes
   - required test commands + manual QA prompts
2. `skills/building-ledger-copy-review/`
   - ESL-first copy checks
   - phrase substitutions for pushy/idiomatic language
3. `skills/building-ledger-release-note/`
   - changelog and PR template generator with required safety sections

Why this first:

- no production runtime risk
- immediate contributor consistency gains
- directly aligned with existing `AGENTS.md` governance

### Option B (moderate risk, sunset): local docs MCP server for contributor agents

Target users: agents helping maintainers navigate repo policy/docs quickly.

Build a small MCP server that exposes:

- curated read-only docs (`AGENTS.md`, `docs/*.md`, `skills/*/SKILL.md`)
- helper tools like `policy_lookup(topic)` and `qa_checklist(change_type)`

Key constraints:

- read-only
- no evidence or resident data exposure
- fixed allowlist of files

Status: sunset for current planning cycle. Do not schedule.

### Option C (careful rollout, sunset): maintenance MCP tools for stewards/devs only

Target users: maintainers, not residents.

Possible tools:

- `export_safety_report(buildingId)` (aggregated checks only)
- `validate_notice_copy(templateId)` against copy constraints
- `run_access_audit()` for key route checks

Hard rule: no tool may output raw private evidence or identifiers.

Status: sunset for current planning cycle. Do not schedule.

## Guidance for agents that browse the web

If you want agents to research external sources safely in this repo workflow, use a dedicated "research skill" plus strict output requirements.

Suggested pattern:

1. Use allowlisted domains only (official docs, standards, known repos).
2. Require extraction into a local markdown note with dated citations.
3. Require a "confidence + risk" section for each claim.
4. Block direct implementation from web findings unless mapped to `AGENTS.md` constraints.

Example allowlist seed:

- `modelcontextprotocol.io`
- `agentskills.io`
- official tool docs for the active stack
- specific GitHub repos already referenced in project docs

## Suggested phased roadmap

### Phase 0 (implemented)

- Kept `building-ledger-agent` as the base contributor skill.
- Added `building-ledger-security-review` and `building-ledger-copy-review`.
- Added `docs/agent-skills-playbook.md` for skill sequencing.
- Added `building-ledger-release-note` for PR/changelog drafting consistency.

### Phase 1

- No MCP server additions planned (sunset).

### Phase 2

- No maintenance MCP tools planned (sunset).

## Safety checklist for any MCP/skill addition

- No new personal identifier collection.
- No public evidence access.
- No write-capable public endpoints.
- No bypass of access key/steward checks.
- No legal-advice automation.
- Explicit rate limiting and auditability for write actions.

## Out of scope for now

- Resident-facing autonomous agents
- Public-mode write tooling
- Any automation that exposes evidence files outside existing gated workflows

## Practical next step (after current implementation)

With in-repo skills now added, keep focus on resident-facing safety work.

Do not add MCP server or maintenance MCP tool surface in the current cycle.
