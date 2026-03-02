# Key Persona Click-Route Critique (2026-03)

## Persona

**Persona:** First-time resident reporter (stressed, ESL-first, wants a simple private record quickly).

**Goal:** Record one issue, understand next step, and avoid unsafe sharing.

---

## Prioritized list of changes

### Priority 1 — do first (high impact, low risk)

1. **Remove repeated instruction lines on locked screens and key-gated screens.**
   - Keep one short instruction block per screen state.
   - Keep one short privacy note.
   - Remove repeated lines such as repeated "Locked" and repeated key guidance.

2. **Show one clear next action per state.**
   - Step 1 state: highlight "Save and continue" only.
   - Key gate state: highlight "Continue" only.
   - Keep support links visible but visually secondary.

3. **Reduce first-screen reading load.**
   - Keep one-line safety guidance near the first input.
   - Move extra explanation into optional helper content.

### Priority 2 — do next (high impact, medium effort)

4. **Hide or collapse downstream locked content until prerequisites are complete.**
   - Show title + lock label only.
   - Expand sections when the user unlocks the step.

5. **Create a compact no-key layout with two choices.**
   - Choice A: enter key now.
   - Choice B: leave and ask a steward.
   - Keep short action text for each choice.

6. **Add direct failure text near the key input.**
   - Example: "Key does not match this building."
   - Keep the line factual and calm.

### Priority 3 — do later (polish)

7. **Tighten visual hierarchy of secondary links and helper cards.**
   - Reduce weight of non-primary actions.
   - Keep focus on the next required action.

8. **Add one short "what to ask" line in access help.**
   - Example: "Ask for the current building key for [Building Name]."

9. **Run a short copy pass for repeated phrases.**
   - Keep language literal, short, and ESL-friendly.
   - Remove duplicate rationale text when the same meaning appears twice.

### High effort, high payoff items

1. **Progressive disclosure by state across the full notice flow.**
   - Show only the current required step and one upcoming locked step summary.
   - Hide advanced panels until prerequisites are complete.
   - **Why payoff is high:** reduces overwhelm for first-time and ESL-first users and can improve completion rate.

2. **Redesign the key-gated building entry into a dedicated two-path screen.**
   - Path A: enter key now.
   - Path B: get key from steward (with one short script users can copy).
   - **Why payoff is high:** lowers abandonment in resident-only access flows while preserving privacy gates.

3. **Unify instruction copy into a reusable guidance system component.**
   - Single source for lock text, key-help text, and short privacy reminders.
   - Apply the same component on home, building gate, and access-help states.
   - **Why payoff is high:** removes repeated wording drift, simplifies maintenance, and keeps copy ESL-first.

---

## Route 1: Home → Start a new issue → Step 1 (Building + issue)

### What works
- The page sets clear safety boundaries early: short facts, no names, no unit numbers.
- The stepper gives predictable structure (4 steps) and communicates lock states.
- The wording is generally neutral and non-pushy.

### What could be streamlined
1. Keep one primary action in the hero area.
   - "Start a new issue" is good, but users then see a dense form area immediately.
   - Consider progressive reveal: hero CTA first, then autofocus on the first required field.

2. Reduce repeated lock messaging.
   - "Locked" and "Finish step 1" cues appear several times in the same viewport.
   - Keep one clear lock note per locked step.

3. Shorten first-screen reading load.
   - Multiple explanatory blocks appear before the user completes one action.
   - Keep one-line safety copy and move longer guidance to helper drawers.

### What seems extraneous or distracting
- Too many top-level cues compete for attention at the same moment (marketing value props + step navigation + lock messages).
- The user can see downstream complexity before finishing the first required choice.

---

## Route 2: Home → Building page (with key required gate)

### What works
- The gate is explicit and supports privacy goals.
- The language explains why the key exists (anti-scraping and anti-retaliation intent).
- The page gives a fallback path (back to notice builder, access help).

### What could be streamlined
1. Consolidate repeated key instructions.
   - "Get the key from a resident steward" and similar lines appear more than once.
   - Keep one concise instruction block + one short safety note.

2. Tighten action hierarchy.
   - Primary action should remain "Continue" with key.
   - Secondary links should be visually quieter to reduce accidental route switching.

3. Add one explicit failure state line after submit.
   - If key is wrong or missing, show a direct line near the input: "Key does not match this building."

### What seems extraneous or distracting
- Duplicate explanation text in both the panel body and the "Access help" section on the same screen.
- Safety notes are helpful but slightly verbose for users already blocked by a single required input.

---

## Route 3: Building page (no key) → Access-help content

### What works
- Access-help framing is calm and practical.
- The copy avoids blame language and keeps privacy focus.

### What could be streamlined
1. Make the no-key screen a single-decision layout.
   - User intent is binary: enter key now or leave and ask steward.
   - Consider a compact two-option layout with less surrounding text.

2. Prevent content duplication across adjacent sections.
   - If access help repeats the same lines as the gate panel, users must re-read instead of acting.

3. Add one concrete "what to ask" snippet.
   - Example: "Ask for the current building key for [Building Name]."

### What seems extraneous or distracting
- Repeated rationale text can feel like friction rather than support when the user just needs to proceed.

---

## Notes on method

- This critique is from a manual browser walkthrough of three common resident paths.
- Focus areas: clarity of next action, reading load, and distraction risk in first-time use.
