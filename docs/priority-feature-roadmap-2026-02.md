# Priority feature and enhancement roadmap (agent-resource scan, 2026-02)

This roadmap prioritizes new work after reviewing repository policy, contributor skills, active TODOs, modernization guidance, and UX audits.

## Sunset decisions (2026-02 update)

The following items are now sunset and should not be scheduled in this roadmap:
- Resident waitlist flow and `/api/waitlist` endpoint
- Docs MCP server prototype and maintenance MCP tool surface

These were removed to keep focus on resident-facing safety workflows.

## Method

Sources reviewed:
- `AGENTS.md`
- `README.md`
- `docs/vision.md`
- `docs/architecture.md`
- `docs/mcp-agent-skills-research-2026-02.md`
- `docs/agent-skills-playbook.md`
- `docs/ux-audit-2026-02.md`
- `TODOS.md`

Prioritization dimensions:
1. Safety/privacy impact
2. Procedural usefulness for residents
3. Delivery risk and implementation effort
4. Testability against existing quality gates

## Priority 0 (do next)

### 1) Share safety checklist as an actionable copy-link gate

What to build:
- Require completion of local-only share safety checks before enabling copy-link actions on submission pages.
- Keep checks concrete (names, phone numbers, emails, unit hints).

Why now:
- Directly reduces accidental doxxing/retaliation risk at the highest-risk user action point (sharing).
- Explicitly recommended by current UX audit.

Success criteria:
- Copy-link controls remain disabled until all checks are ticked.
- Checklist state does not require personal data and does not leave private mode.

Validation:
- Integration tests for gating behavior and disabled/enabled transitions.
- Manual QA: verify copy-link blocked until checks complete.

---

### 2) Public-readonly small-count suppression regression coverage

What to build:
- Add test coverage for count bucketing/suppression in all public-readonly summary surfaces.
- Ensure no exact low counts are rendered when below threshold.

Why now:
- This is a named protection in product policy and still listed as an open engineering TODO.
- Prevents identity inference from low participation counts.

Success criteria:
- Tests fail if exact values below privacy threshold leak to UI/API responses.
- Shared helper for count rendering can be reused in dashboard/detail contexts.

Validation:
- Unit tests for bucketing utility.
- Integration tests for public mode route/API output.

---

### 3) Evidence-upload warning consistency across all upload entry points

What to build:
- Add the same safety warning text to every upload trigger and pre-upload surface.
- Keep text short and literal.

Why now:
- Required by policy and currently tracked as an uncompleted product safety task.
- Low implementation risk and high user protection value.

Success criteria:
- All upload paths display warning before file selection.
- Warning includes faces, names, mail labels, unit numbers, and leases.

Validation:
- UI test/snapshot checks for warning visibility.
- Manual QA across desktop/mobile upload flows.

## Priority 1 (next cycle)

### 4) Waitlist rate-limit and validation edge-case coverage

What to build:
- Add tests for per-IP/session limits, malformed payloads, and unit-number style address hints in waitlist API.

Why now:
- Abuse resistance is a core requirement; waitlist is a write endpoint.
- Already identified in TODOs.

Success criteria:
- Consistent HTTP responses for rate-limit and validation failures.
- No bypass using missing/alternate headers.

Validation:
- Integration tests for 429 and schema validation cases.

---

### 5) Very simple English copy-lint helper for notices

What to build:
- Add a reusable utility/checklist to flag idioms, threatening language, and complex phrasing in notice templates.

Why now:
- Strongly aligned with ESL-first policy and copy-review skill guidance.
- Improves consistency as notice templates expand.

Success criteria:
- Template checks run in tests or lint task.
- Failures point to concrete replacement guidance.

Validation:
- Unit tests over canonical notice templates.

---

### 6) Key-propagation integration tests across dashboard/submission flows

What to build:
- End-to-end-style integration tests that verify resident key handling from building dashboard actions to submission detail actions.

Why now:
- Access control is central to retaliation risk mitigation.
- Listed as open engineering work.

Success criteria:
- Non-key paths are denied consistently.
- Valid key paths preserve intended workflow continuity.

Validation:
- Integration tests for allowed and denied transitions.

## Priority 2 (after guardrails are stable)

### 7) Read-only docs MCP server prototype for contributor agents

What to build:
- A local MCP server that exposes allowlisted policy/docs/skills files and helper lookups.

Why later:
- Adds contributor efficiency but is less urgent than resident-facing safety gaps.
- Needs careful allowlisting and CI checks.

Success criteria:
- Read-only behavior only.
- Allowlist enforced and testable in CI.

Validation:
- CI assertions that disallow non-allowlisted path exposure.

---

### 8) Maintenance-only MCP audit tools (no resident data exposure)

What to build:
- Tools such as `run_access_audit()` and `validate_notice_copy(templateId)` for maintainers.

Why later:
- Useful for operational safety, but introduces additional surface area.
- Should follow successful docs-MCP pilot.

Success criteria:
- No raw evidence or identifiers in outputs.
- Tool call logging and deny-by-default behavior.

Validation:
- Contract tests for redaction and deny paths.

## De-prioritized / keep out of scope

Do not prioritize in current roadmap:
- Comments, chat, reactions, or forum-style interaction
- Public write capabilities
- Identity-heavy authentication requirements
- Public evidence galleries
- Legal-advice automation

## Suggested execution order

1. Share checklist gate (P0)
2. Public-readonly count suppression tests (P0)
3. Evidence warning consistency (P0)
4. Waitlist abuse/validation tests (P1)
5. Very simple English lint helper (P1)
6. Key propagation integration tests (P1)
7. Docs MCP prototype + CI allowlist checks (P2)
8. Maintenance MCP tools with redaction controls (P2)

## Release-note template for this roadmap

When implementing any item above, include:
- Summary of behavior change
- Scope intentionally excluded
- Security/privacy notes
- Test plan + manual QA checklist
- Screenshots for UI updates
