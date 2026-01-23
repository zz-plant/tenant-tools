# Building Ledger

**Shared issue tracking for tenants.**

Building Ledger is a lightweight web app that helps residents log building issues, quietly coordinate with neighbors, and generate clear written notices that create timelines and records.

It is designed for:
- first-time renters
- immigrants / ESL tenants
- residents under stress who need structure more than expression

---

## What this tool does

Building Ledger helps residents:

- Log building issues with minimal input (issue type + start date)
- Add themselves to an issue without writing (“me too”)
- Upload evidence once and attach it to the issue
- See how long an issue has been open
- See when an issue affects multiple residents
- Generate neutral, copy-pasteable repair notices
- Send follow-ups without rewriting messages
- Export summaries for inspectors or legal aid

The tool focuses on **facts, dates, repetition, and aggregation**.

---

## What this tool does *not* do

By design, Building Ledger does **not**:

- Host discussions or comment threads
- Allow long free-text complaints
- Encourage public callouts or naming individuals
- Require users to know legal language
- Replace legal advice or tenant organizations

Constraints are intentional.

---

## Core design principles

- **Structure over tone**  
  Users should not have to “sound official.” The app provides the structure.

- **Facts only, by default**  
  Emotional language is valid but weakens records. The UI limits it.

- **Aggregation over escalation**  
  Patterns matter more than severity. “Me too” is a primary action.

- **Time matters**  
  The interface makes duration visible and unlocks next steps based on time.

- **Safety first**  
  Participation is anonymous by default. Sharing is controlled.

---

## Chicago-aware (configurable)

The MVP is tuned for Chicago / Cook County workflows, including:

- Written notice expectations
- Essential services (heat, water, power)
- 48-hour entry norms
- 311 inspection pathways
- Security deposit deadlines
- Sheriff-only eviction enforcement

These rules are **configuration**, not hard-coded assumptions.

---

## High-level data model

- **Building** — address, visibility mode
- **Issue** — type, start date, status
- **Report** — individual participation (“me too”)
- **Evidence** — photos/videos attached to issues
- **Session** — anonymous, building-scoped identity
- **Steward role** — light review + export

No names.  
No landlord access.  
No public write access.

---

## Visibility modes

### Private (default)
- Resident-only access
- Full issue details and evidence
- Notice generation and exports

### Public (optional, restricted)
- Read-only summaries
- No unit identifiers
- No evidence access
- Aggregated counts only

Public mode is opt-in and constrained to reduce risk.

---

## Intended use

Building Ledger is meant to:
- reduce confusion
- reduce isolation
- reduce self-sabotage
- make timelines visible

It is not meant to:
- shame
- threaten
- perform outrage
- replace collective organizing

---

## Contribution guidelines (short version)

If you contribute:

- Prefer clarity over cleverness
- Prefer boring over expressive
- Prefer safety over exposure
- Optimize for tired users on bad days

Features that increase risk for vulnerable users will be rejected.

---

## Cloudflare KV setup (optional)

If you want to enable shared storage, create two KV namespaces and bind them in Cloudflare:

1. Create a KV namespace in the Cloudflare dashboard for submissions.
2. Create a second KV namespace for waitlist requests.
3. Open your project settings and choose **Bindings**.
4. Add KV namespace bindings for `SUBMISSIONS_KV` and `WAITLIST_KV`.
5. Select each KV namespace and save.

Do not store personal names or unit numbers in KV. Keep only structured issue data.

---

## Vision

For the longer-form product vision, see [docs/vision.md](docs/vision.md).

---

## License

cc0
