# New User Route Critique (Browser Walkthrough, 2026-02)

## Scope

This walkthrough reviews two common first-time resident routes in the current web UI:

1. Route A: Home → Notice builder start (first notice draft)
2. Route B: Home → Building not listed → Waitlist start

The goal is practical UX feedback in three buckets:
- what can be removed
- what needs to be rebuilt
- what needs modification

---

## Route A: Home → Notice Builder Start

### What worked

- The top page states safety constraints early: short facts, no names, no unit numbers.
- The step framing (Basics, Dates, Add facts, Review) gives a clear path.
- The interface repeats privacy constraints near notice output and summary.

### What can be removed

1. Duplicate reminder lines in the same viewport.
   - Similar privacy lines appear multiple times before any action.
   - Keep one high-signal reminder per block to reduce reading fatigue.

2. Repeated save-key explanation text in step 1.
   - The same idea appears in two nearby sentences.
   - Keep one sentence and move details to Review/Save.

3. Passive “Finish step 1” lock text repeated in several areas.
   - One lock message near the blocked section is enough.

### What needs to be rebuilt

1. Step-1 action architecture.
   - The page presents many “downstream” panels (generated notice, summary, checks) before step 1 is complete.
   - Rebuild this so pre-step content only shows essentials:
     - building picker
     - issue picker
     - one short “what happens next” note
   - Hide output and export panels until the step is truly unlocked.

2. First-time completion affordance.
   - “Next” is visible, but the user can still feel blocked because many disabled areas remain on screen.
   - Rebuild with an explicit completion CTA inside step 1 itself:
     - “Done with step 1. Continue to dates.”

### What needs modification

1. Copy length around privacy and keys.
   - Convert to one-line, concrete guidance with no duplication.

2. Visual hierarchy for locked sections.
   - Keep locked sections collapsed by default.
   - Show title + one sentence instead of full panel body.

3. Issue option quality.
   - One issue label includes a smart quote typo (`We are working on it” / no timeline`).
   - Fix punctuation to avoid trust friction.

---

## Route B: Home → Building Not Listed → Waitlist Start

### What worked

- Waitlist entry point is visible from the main builder area.
- Safety framing is present: no names, emails, or phone numbers.
- Two-step concept is clear (add address, then save request code).

### What can be removed

1. Competing page noise when waitlist opens.
   - The full notice builder remains dominant in the same viewport.
   - Remove non-waitlist distractions while waitlist is active.

2. Redundant “Start” language.
   - Multiple “Start” controls on one page can confuse first-time users.
   - Keep one start trigger for builder and one clearly named trigger for waitlist.

### What needs to be rebuilt

1. Waitlist as a focused flow container.
   - Rebuild as a contained panel (or modal-style region) that temporarily isolates:
     - address input
     - privacy warning
     - submit action
     - success state with request code
   - This lowers cognitive load and prevents accidental route drift.

2. Validation feedback moment.
   - Empty submission behavior should return immediate, explicit inline guidance.
   - Rebuild validation visibility so first-time users always see:
     - what is missing
     - how to fix it

### What needs modification

1. Button naming.
   - Rename waitlist trigger to “Start waitlist” (or “Add building”) to avoid ambiguity with builder “Start.”

2. Post-submit confirmation block.
   - Keep it concise and action-based:
     - “Saved. Your request code is: ____.”
     - “Please save this code now.”

3. Input helper text.
   - Add one concrete address example without personal details.

---

## Cross-route priorities

### Highest priority (quick wins)

1. De-duplicate repeated helper and lock text.
2. Rename ambiguous buttons (“Start” collisions).
3. Fix issue label punctuation typo.

### Medium priority (structural UX)

1. Collapse or hide locked sections until prerequisites are complete.
2. Isolate waitlist into a focused mini-flow with clear validation.

### Longer-term improvements

1. Add progress microcopy that tells users exactly one next action.
2. Add first-time mode that suppresses advanced panels until user reaches Review.

---

## Manual QA checklist for follow-up implementation

- Can a first-time user complete step 1 without reading duplicate warnings?
- Is there only one obvious “next action” at each stage?
- Does waitlist submission show explicit inline validation on empty/invalid input?
- Are waitlist and builder starts clearly distinguished by label?
- Are locked panels collapsed and easy to scan?
- Is user-facing copy short, literal, and non-idiomatic?
