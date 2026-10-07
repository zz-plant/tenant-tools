# Rules Pack

This directory contains structured rule data used by notice guidance and policy summaries.

## Purpose

- Keep jurisdiction-specific facts in versioned data files.
- Separate legal-process references from UI code.
- Make updates auditable and citation-backed.

## Layout

- `chicago/*` — city-level housing and notice rule references
- `chicago/rlto_provisions.json` — versioned RLTO rules shown in "Local rules (information only)"
- `cook/*` — county-level enforcement references
- `proposals.json` — pending legislation (for example, Chicago PRO and FAIR) that may change these rules
- `CHANGELOG.md` — rule-data change history

## Versioned provisions (`rlto_provisions.json`)

Each provision has:

- `id`, `title`
- `issues` — issue ids that show the rule card
- `milestone_issues` (optional) — issue ids that add the rule's `timing` date to the issue timeline
- `versions` — one or more versions of the rule

Each version has:

| Field | Meaning |
| --- | --- |
| `status` | `"law"`, `"proposed"`, or `"withdrawn"` |
| `proposal_id` | Required for `"proposed"`. Matches an id in `proposals.json`. |
| `start_date` | `YYYY-MM-DD`. `null` means in effect before this pack began tracking it. |
| `end_date` | `YYYY-MM-DD`, exclusive. `null` means no end date. |
| `section` | Code section shown to residents, for example `RLTO 5-12-110`. |
| `summary`, `details` | Resident text. Short, literal sentences. No fines or threats. |
| `timing` | Optional. `{ amount, unit: "days" \| "hours", label }`, counted from the first written notice. |
| `source_ids` | Ids from the top-level `sources` list. |
| `app_impact` | Maintainer note: what to change in the app when this version becomes law. Required for `"proposed"`. |

### Display rules

- Residents see the `law` version that covers the viewing date.
- A `law` version with a later `start_date` shows as "Starting <date>: …".
- `proposed` and `withdrawn` versions are never shown to residents.
- Timeline dates use the version in effect on the first written notice date.
- `tests/rules.test.ts` checks these rules and simulates a proposal becoming law.

### When pending legislation passes

See `docs/pro-readiness-2026-10.md` section 4. In short: check the proposed version against the final text, set `status: "law"` and `start_date`, set `end_date` on the old version, and do the `app_impact` work.

## Update process

When editing any rule file:

1. Update `last_reviewed`.
2. Verify and refresh `sources` URLs.
3. Keep wording factual and neutral.
4. Record meaningful changes in `CHANGELOG.md`.
5. Do not add personalized legal advice text.

## Data quality requirements

- Prefer plain, literal language.
- Avoid broad legal claims without source links.
- Keep values machine-readable for UI and export consumers.
- Preserve backwards compatibility for existing keys where feasible.

## Contributor note

If you change rule keys or schema shape, document migration impact in the PR summary and update consuming code/tests in the same PR.
