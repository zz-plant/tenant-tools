---
version: 1
slug: "src-pages-buildings-id-astro"
primary_target: "src/pages/buildings/[id].astro"
related_targets: ["src/pages/submissions/[id].astro","src/pages/index.astro","src/components/NoticeBuilder.tsx"]
---

# Resident surfaces: building dashboard, record page, home and notice builder

Mode: Operate. Residents on phones, often stressed and reading in a second language, finishing one job per visit: report a problem, add "me too", send the next notice, log a dated fact. Stewards print and export from laptops.

Job per surface:
- Building dashboard: see open problems by days open, act on the one unlocked next step, report or "me too".
- Record page: one problem's dated facts, the next notice, photos.
- Home: start a notice or open a building ledger.

Constraints: ESL-first copy (AGENTS.md §5), no pressure, no names or unit numbers, private by default, quick exit always visible, pages print cleanly. Copy and functions stay; this round replaces the look and cuts friction.

## Direction contract

THESIS: The building's problems read like the painted signs on the block: big block words, flat enamel colour, one sign telling you what to do next. It refuses the dark SaaS card grid and the cream-paper "ledger" look.

OWN-WORLD: Cool white-wall ground, enamel black ink, flat enamel hues, one per issue type (heat red, water ultramarine, pests green, entry violet, common areas teal, other slate). Chrome yellow is reserved for the one unlocked next step. Big Shoulders block gothic in two widths for display, labels, numerals; the phone's own sans for body. Square-ish 3px corners, 2px black rules, no gradients, no glass, no offset shadows.

STORY: A resident sees their building in block letters, reads one yellow sign that says what is ready, taps it, and leaves. Rows show every problem's colour, days open, households, and next step in fixed columns.

FIRST VIEWPORT: Black top bar (name, Quick exit). Building name in 54px block caps. The yellow next-step sign full width under it, its button inside. Report a problem / Me too as two equal buttons. Problem rows below in fixed columns: colour bar, title with record number, households and next step, DAY count right-aligned in block numerals.

FORM: Block Signage (Chicago storefront and sign-painter lettering), position 7 on the ordered list, seed key e0fd495c. Signature move: the yellow next-step sign board; DAY counts in block numerals.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
