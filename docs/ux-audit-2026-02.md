# UX Audit — Building Ledger (2026-02, Follow-up)

## Scope of this follow-up audit

This follow-up reviews the current resident flow after recent UX updates.

Reviewed areas:
- Notice builder (step flow, copy/save behavior, safety cues)
- Building dashboard (records list, privacy count language)
- Submission permalink (share checks, detail clarity)

Primary question:

**Does the current interface help a stressed resident take one safe next step with low effort?**

This audit uses the same Kondo-style framing:
- **Remove** = reduce noise or risk
- **Move** = keep content, place it at the right decision point
- **Modify** = keep feature, refine wording/interaction for safety and clarity

---

## What improved since the last audit

1. **Step-1 overload was reduced**
   - Optional setup and quick-start actions now appear only after building + issue are selected.
   - This better protects first-time users from early complexity.

2. **Terminology is more consistent**
   - Resident-facing wording moved toward “record,” improving scan clarity.

3. **Privacy explanation is more visible on records list**
   - The dashboard now explains small-count privacy behavior inline.

4. **Share safety is present at permalink time**
   - The “Before you share” checklist appears where link sharing is likely.

These are meaningful improvements and align with safety-first product goals.

---

## Follow-up Kondo recommendations

## 1) Remove

### 1.1 Remove duplicate safety reminders inside the same block

**Observation:** Some sections still include multiple nearby helper lines with overlapping privacy meaning.

**Recommendation:** Keep one concise line per block unless a second line adds new action.

**Why this matters:** Less reading load improves completion for ESL/stressed users.

---

### 1.2 Remove optional “next” framing when user cannot act yet

**Observation:** Some progression hints appear before prerequisites are complete.

**Recommendation:** Suppress “next step” action language until the user has unlocked that action.

**Why this matters:** Reduces false urgency and confusion.

---

### 1.3 Remove high-risk destructive action from dense save area

**Observation:** “Clear form and start over” remains in the same save/export zone.

**Recommendation:** Move it behind a secondary details element (for example, “More actions”) and keep confirm prompt.

**Why this matters:** Lowers accidental data loss risk during copy/save tasks.

---

## 2) Move

### 2.1 Move resident-key input to save section and keep only awareness in step 1

**Observation:** Step 1 currently includes key input plus a top-level reminder.

**Recommendation:** Keep a small awareness chip in step 1 and place full key input where save happens.

**Suggested copy:**
> You can build a notice now. You need the key only to save a shared record.

**Why this matters:** Keeps early flow focused while preserving discoverability.

---

### 2.2 Move “privacy status strip” next to copy/share actions only

**Observation:** Privacy checks are useful, but their value is highest at copy/share moments.

**Recommendation:** Anchor privacy status directly above copy notice / copy link controls.

**Why this matters:** Better timing increases correction before external sharing.

---

### 2.3 Move helper text for count bucketing to every count context

**Observation:** The dashboard now explains count bucketing, but not all count surfaces echo this.

**Recommendation:** Reuse one short helper sentence near report counts in list/detail contexts.

**Why this matters:** Consistent privacy explanation reduces mistrust (“why is count not exact?”).

---

## 3) Modify

### 3.1 Modify share checklist into an actionable gate for copy-link

**Observation:** Checklist is currently advisory only.

**Recommendation:** Keep it local-only and disable “Copy link” until all checks are ticked.

**Why this matters:** Adds a lightweight safety pause at the exact risk point.

---

### 3.2 Modify checklist copy to be more literal and concrete

Current examples are good; make one line more explicit:
- “I removed contact details” → “I removed phone numbers and email addresses.”

**Why this matters:** Reduces ambiguity for ESL users.

---

### 3.3 Modify mobile step navigation hint

**Observation:** “Swipe to see all steps” can remain discoverability-heavy.

**Recommendation:** Keep explicit previous/next buttons and shorten hint text:
> Use step buttons below on mobile.

**Why this matters:** Action language is clearer than gesture instruction.

---

### 3.4 Modify export audience explanations to show consequence labels

**Observation:** Audience options are present but consequences may still be abstract.

**Recommendation:** Add short consequence labels under each option:
- “Inspector: includes timeline + factual details”
- “Management: excludes evidence details”

**Why this matters:** Reduces wrong export selection.

---

## Prioritized implementation sequence (next small iterations)

### Iteration A (fast + low risk)
- De-duplicate helper copy in dense blocks.
- Move clear/reset into “More actions.”
- Normalize count-bucketing helper across contexts.

### Iteration B (flow simplification)
- Keep key awareness in step 1; move key input to save block.
- Keep progress hints hidden until action is unlocked.

### Iteration C (share safety)
- Turn share checklist into local copy-link gate.
- Tighten checklist wording for concrete PII examples.

### Iteration D (mobile/export polish)
- Update mobile hint copy.
- Add consequence microcopy under export audience options.

---

## Manual QA checklist for this follow-up plan

- First-time user can finish step 1 without reading optional controls.
- User understands when key is needed and where to add it.
- Clear/reset is hard to trigger by mistake.
- Share checklist blocks link copy until all checks are complete (if gating is added).
- Count privacy behavior is clear in dashboard and detail views.
- Mobile step progress is clear without swipe-only discovery.
- Copy remains short, literal, and non-idiomatic.

---

## Suggested metrics for next review

- Step-1 completion rate
- Save attempt success (first try)
- Save failures due to missing key
- Link copy attempts before checklist completion
- Mobile drop-off before step 2
- % of records shared with checklist completed (if instrumented)
