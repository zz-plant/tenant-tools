# UX Audit — Building Ledger (2026-02)

## Method

- Reviewed key resident flows in the notice builder, building dashboard, and submission detail pages.
- Reviewed privacy and safety copy, progressive disclosure, and accessibility cues.
- Cross-checked current behavior against project safety goals in `AGENTS.md`.

## What is working well

1. **Clear safety framing at entry points**
   - Home and dashboard surfaces repeat privacy guardrails early.
   - Copy is mostly short and literal.

2. **Strong progressive flow for stressed users**
   - Step locking and progress indicator reduce early complexity.
   - Quick-start and guided-action blocks reduce decision friction.

3. **Privacy-minded defaults are visible in UI**
   - Evidence warnings are present inline.
   - Report counts are bucketed for small numbers.

4. **Operational usefulness is strong**
   - Export and timeline support procedural next steps.
   - “Me too” is one-click and low effort.

## Highest-priority UX improvements (recommended)

### 1) Add one persistent “privacy status” strip in preview

**Why:** Safety reminders are present but fragmented. A single compact status strip helps users verify sharing risk before copy/save.

**Proposed UI:**
- `No names detected` / `Review detail text`
- `No unit hints detected` / `Unit hint found`
- `Evidence note included` / `No evidence note`

**Impact:** High safety + confidence; low implementation complexity.

### 2) Reduce step-1 density by splitting “basics” and “context”

**Why:** Current step 1 combines building, issue gallery, location, stage, language toggles, and dates setup entry points. For first-time users this creates visual overload.

**Proposed changes:**
- Keep only **building + issue** in first fold.
- Move **location/stage/language toggles** into an expandable “Optional setup” block collapsed by default.
- Keep quick-start cards but place them below primary required fields.

**Impact:** High completion rate gain for first-time users.

### 3) Make building-key requirements explicit earlier

**Why:** Save failure due to missing key is handled, but key awareness occurs relatively late (preview/save block).

**Proposed changes:**
- Add an always-visible “Resident key needed to save” chip near top action area.
- Add a non-blocking inline prompt in step 1: “Have key now?” with optional input.
- Keep current secure behavior; this is discoverability only.

**Impact:** High reduction in last-step confusion.

### 4) Add “before you share” checklist in submission permalink view

**Why:** Current warning text is good, but share intent can be supported with a quick checkbox checklist (local-only, no persistence).

**Proposed checklist:**
- I removed names.
- I removed unit numbers.
- I removed contact details.

**Impact:** High safety for external sharing.

### 5) Improve accessibility for step navigation on mobile

**Why:** The hint says “swipe to see all steps,” but discoverability can still be weak for some users.

**Proposed changes:**
- Add explicit left/right step buttons near tabs on mobile.
- Ensure tab labels remain fully visible with horizontal snap and stronger active-state contrast.

**Impact:** Medium-high usability improvement.

## Medium-priority refinements

1. **Clarify CTA hierarchy in preview panel**
   - Today, `Copy text`, `Repeat`, and `Reset` appear together; `Reset` is risky near primary actions.
   - Move `Reset` into tertiary link-style action with confirmation.

2. **Normalize terminology consistency**
   - Use one canonical phrase for records: pick either “submission,” “ledger entry,” or “record” for user-facing headings.

3. **Contextual helper text for stage selection**
   - Stage A/B/C can still feel abstract. Add one-line examples under stage radio options.

4. **Surface count bucketing meaning inline**
   - Add tooltip: “Small counts are hidden to protect resident privacy.”

5. **Make export audience choice self-explanatory**
   - Show one-sentence consequence under each audience option (what is included/excluded).

## What to remove or de-emphasize

1. **De-emphasize duplicate safety copy blocks**
   - Keep one strong reminder per section instead of repeating similar lines several times.

2. **Reduce decorative complexity in hero section**
   - Multiple hero action buttons plus step cards can feel like two competing onboarding paths.
   - Keep one primary “Start” action and move other jump links to subtle anchors.

3. **Avoid showing too many optional controls before required completion**
   - Maintain strict progressive reveal for optional details to lower cognitive load.

## Suggested UX roadmap (4 short iterations)

### Iteration 1 (1–2 days)
- Add preview privacy status strip.
- Reposition reset action.
- Add inline copy explaining small-count bucketing.

### Iteration 2 (2–3 days)
- Simplify step-1 first fold.
- Collapse optional setup by default.
- Add early resident-key awareness chip.

### Iteration 3 (1–2 days)
- Add mobile step-nav affordances.
- Improve active focus and contrast checks for tabs and quick-start cards.

### Iteration 4 (1–2 days)
- Add submission share checklist.
- Harmonize record terminology.

## Success metrics to track

- Step-1 completion rate
- Save success rate on first attempt
- Rate of save errors due to missing key
- Time-to-first-copy
- Share safety checklist completion rate (if added)
- Mobile abandonment before step 2

## QA checklist for UX updates

- First-time user can complete step 1 without guidance.
- User understands key requirement before pressing save.
- Reset action cannot be triggered accidentally.
- Privacy warnings are visible at key decision points (copy/save/share).
- Mobile users can reliably navigate all steps.
- Copy remains ESL-first and non-idiomatic.
