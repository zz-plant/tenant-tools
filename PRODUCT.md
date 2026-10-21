# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Residents** of tenant buildings, first in Chicago (2400 W Wabansia and 2353 W Wabansia today). The tool serves more than one building, and a tenant union can run its own copy for many (`docs/self-hosting.md`).
- Many are first-time renters, immigrants, or ESL readers. Many are under stress: the heat is off, a ceiling leaks, management does not answer.
- Most open the site on a phone, from a resident link shared in a group chat or in person. They come back to the same building ledger many times.
- **Stewards** are residents who hold the steward key. They add buildings, issue keys, count a canvass, export data, and print reports. They print and export more than residents do.

## Product Purpose

Tenant Tools helps residents turn a building problem into a clear, dated record and a neutral written notice, and helps neighbors show that a problem affects many households without writing or naming anyone.

Success: a resident can report a problem, send a notice, and add a dated fact in a few taps, without legal words. A building group can bring a printable, factual summary to management, an inspector, legal aid, or an alderperson.

## Positioning

A shared, private ledger for one building, where structure replaces tone. Residents do not have to "sound official": the app provides the facts, the dates, the counts ("me too"), and the next normal step, unlocked by time. It is not a forum, not legal advice, and not a public shaming tool.

## Operating Context

- Resident links carry a building key. The key moves into a private cookie. "Quick exit" and "Forget key on this device" exist for shared phones.
- Notices go out by copy, email, or text from the resident's own phone. Saved records gain dated facts: management replied, repair promised, repair done, 311 number, follow-up sent.
- Follow-up and final reminder notices unlock by time (day 3, day 6).
- Paper matters: printable rights guide (`/rights`), starter kit (`/kit`), building export, meeting report, joint letter, 311-day plan.
- Group rituals: meetings, door-knocking canvasses (counts only), group 311 days.

## Capabilities and Constraints

- Astro 7 on Cloudflare Workers, React for the notice builder. KV for records, private R2 for photos.
- Notices in Standard and Very simple English. Spanish, Hindi, and Polish drafts exist but are not shown until a fluent reviewer checks them (AGENTS.md §14).
- No names, emails, phone numbers, or unit numbers. No comments, threads, or reactions. No public evidence. Small counts must not identify a household.
- Copy is ESL-first: short literal sentences, no idioms, no metaphors, no pressure or legal threats (AGENTS.md §5–6).
- Escalation is unlock-based, never pushy. No dark patterns, engagement loops, or notifications.

## Brand Commitments

- Name: "Tenant Tools" (renamed from "Building Ledger" on 2026-10-21; the old name described only the record). Home headline: "Put it in writing. Act together."
- Voice by context: warm and plain when asking a resident for input; calm and formal, like an official record, for notices, records, exports, and printouts.

## Evidence on Hand

- Real product copy, notice templates, and Chicago rules data in `src/data/`.
- Link-preview images in `public/og/`.
- No testimonials, usage numbers, partner logos, or press. Do not invent any.

## Product Principles

1. Structure over tone: the app supplies the official shape so residents only supply facts and dates.
2. Safety first: anonymous by default, private by default, easy exit on a shared phone.
3. Aggregation over escalation: "me too" and counts matter more than severity.
4. Time is visible: how long a problem has been open, and what step is unlocked next.
5. Fewest taps for the stressed: one clear next action on every screen.

## Accessibility & Inclusion

- Readers with limited English: short sentences, plain words, Very simple English option.
- Phone-first, one-handed use; large touch targets.
- Keyboard-navigable forms, visible focus, high contrast (AGENTS.md §14).
- Pages must print cleanly.
