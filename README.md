# Building Ledger

**Shared issue tracking for residents.**

Building Ledger is a privacy-first web app for tenant buildings. Residents can log repair issues, join existing issues with “me too,” and generate neutral notices without needing legal language.

## Product boundaries (non-negotiable)

Building Ledger is intentionally limited.

- It is **not** a forum.
- It is **not** legal advice.
- It is **not** a public shaming tool.

Design choices prioritize:

1. Safety and anti-retaliation defaults
2. Simple input for stressed and ESL users
3. Factual, date-based reporting
4. Procedural usefulness (not intimidation)

## What residents can do

- Log issues with structured fields
- Add “me too” participation without writing a long narrative
- Upload private evidence with safety warnings
- Generate calm notice templates (standard + very simple English)
- Export summaries for inspection/legal-aid workflows

## What contributors must protect

- No names, emails, phone numbers, or unit numbers by default
- No public evidence access
- No public write paths
- No comments/chat/reactions
- No threatening or pushy escalation language

See [`AGENTS.md`](AGENTS.md) for full required policy.

---

## Developer quick start

### Requirements

- Node 20+
- bun 1.2+

### Install and run

```bash
bun install
bun run dev
```

### Test

```bash
bun run test
```

### Build

```bash
bun run build
```

---

## Environment setup

The app can run without production KV, but shared data features require Cloudflare bindings.

### Required for shared submission storage

- `SUBMISSIONS_KV`

### Access control keys

- `BUILDING_KEYS_JSON` — JSON map of building id → resident key (recommended)
- `BUILDING_ACCESS_KEY` — fallback key when a building does not exist in `BUILDING_KEYS_JSON`
- `STEWARD_KEY` — required for status updates and steward actions

### SEO and sitemap

- `SITE_URL` — preferred full site origin used to build canonical URLs and sitemap entries (example: `https://app.example.org`). If unset, build tooling may fall back to deploy URL environment variables and will log a warning.

Example `BUILDING_KEYS_JSON`:

```json
{
  "2400 W Wabansia": "REPLACE_WITH_PRIVATE_KEY_2400",
  "2353 W Wabansia": "REPLACE_WITH_PRIVATE_KEY_2353"
}
```

Never commit real keys to git.

---

## Contributor workflow

1. Read [`AGENTS.md`](AGENTS.md) before changing product behavior or copy.
2. Keep changes small and scoped.
3. Add tests when touching access, validation, evidence, export, or notice logic.
4. Run `bun run test` before opening a PR.
5. For UI changes, include screenshots.
6. Update `CHANGELOG.md` for user-visible behavior changes.

### Commit format

Use Conventional Commit style:

- `feat: ...`
- `fix: ...`
- `chore: ...`

---

## Documentation map

- Product intent: `docs/vision.md`
- Architecture and data flow: `docs/architecture.md`
- Modernization roadmap: `docs/priority-feature-roadmap-2026-02.md`
- Design focus shortlist: `docs/designs-to-rethink-2026-02.md`
- Dependency capability review: `docs/tech-stack-capability-research-2026-02.md`
- Agent skills playbook: `docs/agent-skills-playbook.md`
- Rule data pack notes: `src/data/rules/README.md`
- Core agent skill: `skills/building-ledger-agent/SKILL.md`
- Release-note skill: `skills/building-ledger-release-note/SKILL.md`

---

## License

CC0
