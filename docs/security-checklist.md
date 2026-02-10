# Security and privacy release checklist

Use this list before release and for high-risk PRs.

## 1) Access control

- [ ] Resident-only pages require a valid building key.
- [ ] Steward actions require a steward key.
- [ ] Unauthenticated or wrong-key requests are denied.

## 2) Data minimization

- [ ] No new required personal identifiers (name, email, phone, unit).
- [ ] Optional free-text fields stay length-limited.
- [ ] New fields are justified and documented.

## 3) Evidence safety

- [ ] Evidence remains private by default.
- [ ] Public/read-only views never expose evidence files.
- [ ] File upload limits and allowlists are enforced.
- [ ] Upload warning copy reminds users to avoid faces/names/unit hints.

## 4) Public-mode protections (if touched)

- [ ] Public mode is read-only.
- [ ] Small counts are bucketed or suppressed.
- [ ] Unit hints and precise locations are hidden.
- [ ] Resident free-text is removed or replaced with curated tags.
- [ ] Disclaimer is present: “Resident-reported. Not verified.”

## 5) Abuse resistance

- [ ] Write endpoints use rate limiting.
- [ ] Bot/spam controls are still active.
- [ ] No endpoints allow anonymous mass writes without controls.

## 6) Verification commands

Run and record outputs:

- `npm test`
- `npm run build`

If a command cannot run due to environment limits, document why and create follow-up tasks.
