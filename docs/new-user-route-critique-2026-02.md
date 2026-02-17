# New User Route Critique (Browser Walkthrough, 2026-02)

## Scope

This walkthrough reviews two common first-time resident routes in the current web UI:

1. Route A: Home → Notice builder start (first notice draft)
2. Route B (sunset): Home → Building not listed → Waitlist start

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

## Route B: Home → Building Not Listed → Waitlist Start (sunset)

This route is now sunset and should not be expanded.
Keep this section as archive context only.

If waitlist UI remains in legacy builds, use maintenance-only fixes:
- keep copy short and factual
- keep validation explicit
- avoid adding new steps or new data collection

---

## Cross-route priorities

### Highest priority (quick wins)

1. De-duplicate repeated helper and lock text.
2. Rename ambiguous buttons (“Start” collisions).
3. Fix issue label punctuation typo.

### Medium priority (structural UX)

1. Collapse or hide locked sections until prerequisites are complete.

### Longer-term improvements

1. Add progress microcopy that tells users exactly one next action.
2. Add first-time mode that suppresses advanced panels until user reaches Review.

---

## Manual QA checklist for follow-up implementation

- Can a first-time user complete step 1 without reading duplicate warnings?
- Is there only one obvious “next action” at each stage?
- Are locked panels collapsed and easy to scan?
- Is user-facing copy short, literal, and non-idiomatic?
