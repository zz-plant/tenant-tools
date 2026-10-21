---
name: Tenant Tools
description: Resident issue tracker and notice builder, painted like the signs on a Chicago block.
colors:
  sign-yellow: "#f2c200"
  sign-yellow-hover: "#ffd21a"
  street-green: "#0b6b3f"
  street-ink: "#ffffff"
  enamel-black: "#151515"
  wall: "#f3f4f1"
  board-white: "#ffffff"
  wall-shade: "#e9ebe6"
  wall-shadow: "#dcdfd8"
  ink-secondary: "#363833"
  ink-muted: "#595c55"
  ink-disabled: "#9a9d95"
  rule-light: "#c9ccc4"
  rule-hover: "#8d9088"
  focus-blue: "#1f3fa6"
  issue-heat: "#d3261e"
  issue-leak: "#1f3fa6"
  issue-pests: "#1e8a4c"
  issue-entry: "#6b3fa0"
  issue-common: "#0f7c83"
  issue-slate: "#55595f"
  issue-lockout: "#8a1c4a"
  danger: "#c21f18"
  success: "#1e7a44"
  night-board: "#121311"
  night-panel: "#1b1c1a"
  night-ink: "#f3f4f1"
typography:
  display:
    fontFamily: "Big Shoulders, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "clamp(2.6rem, 7vw, 4.75rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Big Shoulders, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "clamp(2rem, 6vw, 3rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "0.005em"
  title:
    fontFamily: "Big Shoulders, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "clamp(1.35rem, 3.6vw, 1.6rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.005em"
  numeral:
    fontFamily: "Big Shoulders, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "clamp(2.6rem, 8vw, 3.4rem)"
    fontWeight: 900
    lineHeight: 0.85
    fontFeature: "tnum"
  label:
    fontFamily: "Big Shoulders, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0.04em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  xs: "2px"
  sm: "3px"
  lg: "4px"
  xl: "6px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.enamel-black}"
    textColor: "{colors.board-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 18px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.board-white}"
    textColor: "{colors.enamel-black}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 18px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.wall-shade}"
  next-sign:
    backgroundColor: "{colors.sign-yellow}"
    textColor: "{colors.enamel-black}"
    rounded: "{rounded.lg}"
    padding: "18px 20px 20px"
  next-sign-button:
    backgroundColor: "{colors.enamel-black}"
    textColor: "{colors.sign-yellow}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: "52px"
  input:
    backgroundColor: "{colors.board-white}"
    textColor: "{colors.enamel-black}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    height: "48px"
  fact-tag:
    backgroundColor: "{colors.board-white}"
    textColor: "{colors.enamel-black}"
    rounded: "{rounded.sm}"
    padding: "4px 12px"
    height: "40px"
  fact-tag-selected:
    backgroundColor: "{colors.enamel-black}"
    textColor: "{colors.board-white}"
  street-sign:
    backgroundColor: "{colors.street-green}"
    textColor: "{colors.street-ink}"
    padding: "0.16em 0.32em 0.1em"
  street-sign-small:
    backgroundColor: "{colors.street-green}"
    textColor: "{colors.street-ink}"
    padding: "0.2em 0.4em 0.14em"
  stop-dot:
    backgroundColor: "{colors.board-white}"
    size: "26px"
  stop-dot-compact:
    backgroundColor: "{colors.board-white}"
    size: "12px"
  top-bar:
    backgroundColor: "{colors.enamel-black}"
    textColor: "{colors.wall}"
    padding: "10px 40px"
  quick-exit:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.enamel-black}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "40px"
---

# Design System: Tenant Tools

> Renamed from "Building Ledger" to "Tenant Tools" on 2026-10-21. The header, favicon, icons, and link-preview cards use the new name.

## Overview

**Creative North Star: "Block Signage"**

The building's problems read like the painted signs on a Chicago block: storefront and sign-painter lettering in big block words, flat enamel colour on a cool white wall, and one yellow sign that tells a resident what they can do next. A resident on a phone, often reading in a second language, should see their building's name in block capitals, read the one yellow sign, tap it, and leave. The building's address hangs on a green street-name blade, and the block itself, two-flats, greystones, a courtyard building, a corner store, is drawn in one line at the foot of the page.

Density is calm and columnar. Problems are rows, not cards: an issue-colour bar on the left, a block-letter title, plain-language facts, and a day count painted big on the right. Sections are separated by 2px black rules painted across the wall, never boxed. Night mode is the same signs painted on a dark board, not a different theme.

The world refuses the dark SaaS card grid and the cream-paper "ledger" look it replaced. Nothing glows, floats, or shines: no gradients, no glass, no shadows on boxes. The one offset is a sign painter's drop shade under a single heading.

**Key Characteristics:**
- Big Shoulders block gothic in caps for headings, labels, buttons, and numerals; the phone's own sans for every sentence.
- Chrome yellow appears once per screen, on the one unlocked next step.
- One flat enamel hue per issue type, the same on every screen.
- 2px black rules instead of card boxes; corners of 2 to 6px.
- Building addresses on green Chicago street-name blades; green means an address, never a problem.
- A problem's steps drawn as an 'L' stop line in its own enamel.
- One motion moment: the "Me too" count bump.

## Colors

A cool white wall, enamel black ink, a fixed set of flat enamel issue hues, and one chrome yellow held in reserve.

### Primary
- **Chrome Sign Yellow** (`sign-yellow`): the background of the one next-step sign board on the building dashboard and the record page. Its ink is always Enamel Black. Hover on yellow surfaces lightens to `sign-yellow-hover`.

### Tertiary (street sign)
- **Street Sign Green** (`street-green`): the blade and the hundred-block plate of a building address. Lettering and the inner rule are Street Ink (`street-ink`), white. It is the same in light and dark mode, like a real sign at night.

### Secondary (issue enamels)
Each issue type owns one enamel hue, applied through `data-issue` on the element (it sets a local `--issue` property). The hue fills the left colour bar of a problem row, the square in a filter chip, the icon tile in the notice builder, the day-count plate on a record page, the reached stops of the stop line, and the drop shade on a record heading. White (`--issue-ink`) is the ink on any filled enamel.
- **Heat Red** (`issue-heat`): heat and hot water.
- **Ultramarine** (`issue-leak`): water leaks.
- **Pest Green** (`issue-pests`): pests.
- **Entry Violet** (`issue-entry`): entry without notice and access.
- **Common Teal** (`issue-common`): elevators and common areas.
- **Slate** (`issue-slate`): no-timeline and deposit issues.
- **Lockout Plum** (`issue-lockout`): lockouts.
- Building-wide issues use Enamel Black.

### Neutral
- **Enamel Black** (`enamel-black`): all text, primary buttons, the top bar, and every 2px rule.
- **White Wall** (`wall`): the page canvas.
- **Board White** (`board-white`): panels, inputs, secondary buttons, unselected tags.
- **Wall Shade** (`wall-shade`) and **Wall Shadow** (`wall-shadow`): hover and pressed fills; the warning board.
- **Ink Secondary / Ink Muted / Ink Disabled** (`ink-secondary`, `ink-muted`, `ink-disabled`): body sentences, meta lines, disabled labels.
- **Light Rule / Hover Rule** (`rule-light`, `rule-hover`): 1px dividers between list items, input borders at rest.
- **Focus Blue** (`focus-blue`): the 3px focus outline and the text caret.
- **Night Board / Night Panel / Night Ink** (`night-board`, `night-panel`, `night-ink`): the dark-mode canvas, surface, and ink. In dark mode every issue hue shifts to a lighter enamel (set in `base.css`) and issue ink becomes Night Board.

### Status
- **Danger** (`danger`) and **Success** (`success`): used as text colour and border, with pale tinted fills (`--color-danger-subtle`, `--color-success-subtle`). Never for decoration.

### Named Rules
**The One Yellow Sign Rule.** Chrome yellow marks the one next step a resident can take now. It is never decoration, never a highlight, and never a warning. The single other use is the "Me too" count flash, which confirms the resident's own action and fades within 1.4s.

**The Neutral Warning Rule.** Warnings use the Wall Shade board with a black rule and black text. Yellow belongs to the next step only.

**The Green Means Address Rule.** A green blade marks a building address and nothing else. It never stands for a problem type, a status, or an action. Pest Green is a different, lighter enamel, and success messages keep their own green.

**The One Hue Per Problem Rule.** An issue type's enamel is the same on every screen and in every mode's lightness step. Never pick an issue colour per page, and never give two issue types the same hue except the slate pair.

## Typography

**Display Font:** Big Shoulders (self-hosted variable woff2, weights 500 to 900, latin and latin-ext subsets, OFL), falling back to Arial Narrow and Roboto Condensed.
**Body Font:** the system sans stack (-apple-system, Segoe UI, Roboto, Helvetica Neue, Arial).

**Character:** Chicago sign-painter block gothic set in caps for everything a resident scans, and the phone's own font for everything a resident reads. The system font covers the Spanish, Hindi, and Polish the notices use; Big Shoulders does not.

### Hierarchy
- **Display** (900, clamp 2.6rem to 4.75rem, line-height 0.88, caps): the page name. On a building page the address is set as a large street sign instead (900, clamp 2.6rem to 4.75rem at 9vw, line-height 1).
- **Headline** (800, clamp 2rem to 3rem, line-height 0.9, caps): the next-step sign heading. Panel headings use clamp 1.7rem to 2.2rem.
- **Title** (800, clamp 1.35rem to 1.6rem, line-height 1, caps): problem-row titles, tool names, section sub-heads.
- **Numeral** (900, clamp 2.6rem to 3.4rem, line-height 0.85, tabular): the DAY count right-aligned in each row; up to 5rem on the record-page plate. Board counts use 2rem at 900.
- **Label** (800, 1.12rem, 0.04em tracking, caps): buttons, tag labels, timeline dates (1.15rem), summary toggles, top-bar items. Stop-line names are 800 at 1rem and never wrap (0.86rem below 480px); the compact "N of 6 steps" count is 700 at 0.95rem with 0.04em tracking.
- **Body** (400, 16px, line-height 1.55 to 1.6, max 68ch): every sentence, meta line, and helper note. Form labels are 600 at 0.95rem.

### Named Rules
**The Two Voices Rule.** Big Shoulders sets h1 to h4, labels, buttons, and numerals, always in caps. It never sets a sentence. Anything a resident reads as a sentence, in any language, is the system font.

**The Lined-Up Numbers Rule.** Dates, counts, and table cells use tabular figures so they line up in columns.

## Layout

A single centred column up to 1180px, with gutters of clamp(24px, 4vw, 40px) on desktop, 20px on tablet, and 16px on mobile. Sections stack with a 28px gap. The top bar is sticky and respects safe-area insets.

Problem rows are a fixed three-column grid: an 8px issue-colour bar, the main column (title, meta, next step, actions), and the right-aligned day count, with 14px column gap and 14px vertical padding. The two main actions under the next-step sign ("Report a problem", "Me too") sit as two equal columns up to 520px wide. The next-step block and the record's stop line cap at 760px. The stop line is six equal columns; the compact line in a dashboard row is min(180px, 60%) wide with its step count beside it.

Breakpoints step down at 900px, 720px, and 480px. Below 480px, the record page's day-count plate moves under the title and share buttons go full width. Issue filter chips scroll horizontally instead of wrapping. The block skyline is clamp(72px, 9vw, 112px) tall; at 600px and below it switches to the narrow drawing. Print layouts drop the top bar's controls, the skyline, and the drop shade, turn backgrounds white, and keep the black rules.

## Elevation & Depth

Paint sits flat on the wall. Depth comes from rules and fills, not shadows: a 2px black rule opens each section and each problem row, and 1px light rules divide list items. Only things that actually float lift: select menus and the skip link. The sticky top bar does not cast a shadow. Lettering is the one exception: a sign painter's drop shade under one heading per page.

### Shadow Vocabulary
- **Floating menu** (`box-shadow: 0 10px 24px -6px rgba(21, 21, 21, 0.18)`): select popups.
- **Skip link** (`box-shadow: 0 4px 12px -2px rgba(21, 21, 21, 0.14)`): the skip link when focused.
- **Input focus halo** (`box-shadow: 0 0 0 3px` focus blue at 25%): input focus, paired with a focus-blue border.
- **Painted drop shade** (`text-shadow: 0.045em 0.045em 0`, no blur): the record h1 and the home h1. It takes the problem's enamel inside a `data-issue` scope and Hover Rule grey (`--color-border-hover`) elsewhere.

### Named Rules
**The Flat Paint Rule.** Surfaces at rest never have a shadow. No gradients, no glass, no backdrop blur, and no hard offset shadow on any box, button, board, or panel. The one exception is lettering: the sign painter's drop shade, on at most one heading per page.

**The Honest Shade Rule.** The drop shade is a problem's colour only under that problem. Anywhere else it is neutral grey, so no colour suggests a problem that is not there.

## Shapes

Sign boards have nearly square corners: 2px for small chips and the count flash, 3px for buttons, inputs, tags, and icon tiles, 4px for the next-step sign and the record day plate, 6px for the favicon tile. Colour bars and filter squares use 1px. Full circles appear only for status dots, radio controls, and stop-line dots. Street-sign blades and plates round their corners with the lettering (0.14em: about 3px on a small sign, 6 to 11px on a large one) and carry a white rule just inside the edge, drawn as an outline with a negative offset. Edges are 2px solid strokes; containers are open-sided sections under a rule rather than closed boxes.

**The Rule Not Box Rule.** Group content under a 2px black top rule. Do not draw a four-sided card around it.

## Components

### Buttons
Painted sign buttons: block letters, a 2px edge, nearly square corners.
- **Shape:** 3px radius, 2px border, minimum height 48px (40px compact).
- **Primary:** Enamel Black fill, white Big Shoulders caps at 800, padding 8px 18px.
- **Secondary:** Board White fill, black 2px border, black label.
- **Hover / Focus:** fill darkens (primary) or shifts to Wall Shade (secondary) over 160ms; press nudges down 1px; focus is a 3px Focus Blue outline offset 2px.
- **Disabled:** Wall Shade fill, light rule border, muted label.
- **Danger:** a red fill with white caps for destructive actions.

### Next-Step Sign (signature)
The one yellow board on the dashboard and the record page. Chrome yellow fill, 4px radius, padding 18px 20px 20px. A Big Shoulders headline names the step in caps; one body sentence says why it is ready; a black button with yellow letters (52px tall, 1.25rem label) performs it. When no step is unlocked, the calm variant replaces it: no fill, a 2px black top rule, a smaller headline.

### Problem Row (signature)
An 8px enamel bar in the issue's colour runs the full height of the row. The title is block caps and links to the record; meta and the next step sit beneath in the body font; "Me too" and the row's action are compact buttons. The DAY count is painted on the right in 900-weight numerals, with "DAYS" in small tracked caps below. In rows the next step is a black button, not yellow.

### Record Day Plate
On a record page the day count sits on a 4px-radius plate filled with the issue's enamel, numerals in issue ink up to 5rem.

### Street Sign (signature)
A building address set like a Chicago street-name sign: white block caps on a Street Sign Green blade, with the inner white rule. An address that starts with a number and a direction splits: the street name sits on the blade with its street type small after it (AVE, DR), and the hundred-block number with its direction sits on its own plate ("2400 W"). Any other address shows whole on the blade. Screen readers hear the address once, as written; the painted parts are hidden from them.
- **Large:** the building-page h1, stacking the plate's number over its direction.
- **Small:** 1.5rem (1.6rem as a home-page building link, with a right arrow, 48px tall) beside the record title and on the home page. The blade and plate never wrap apart, and the plate stays on one line.

### Stop Line (signature)
A problem's steps drawn as an 'L' line with six stops: Started, Notice, Follow-up, Final, 311, Fixed. The line takes the problem's enamel from `data-issue`.
- **Done:** a dot filled in the enamel. **Open:** a heavy black ring. **Locked:** a dashed grey ring (a solid grey dot in the compact line). **Later:** an empty grey ring.
- **Track:** grey, and in the enamel only between two reached stops.
- **Full** (record page): 10px track, 26px dots, a block-caps stop name that never wraps, and a short date or state below in the body font.
- **Compact** (dashboard rows): 4px track and 12px dots, hidden from screen readers, followed by the written count "N of 6 steps" in block caps.

### Block Skyline
One 2px line drawing of a Chicago block in the text colour: a two-flat, a greystone three-flat, a courtyard building, a worker's cottage, and a corner store, standing on one ground line. It sits at the foot of the home intro and above the building-page footer. Phones get a drawing that ends after the courtyard building, so no building is cut in half. Decorative, hidden from screen readers, and left out of print.

### Painted Heading
The home h1 and the record h1 carry the sign painter's drop shade (see Elevation & Depth). No other heading on the page does.

### Chips and Tags
- **Style:** Board White, 2px black border, 3px radius, Big Shoulders caps at 700, minimum height 40px.
- **State:** selected tags fill Enamel Black. Issue filter chips carry a 10px enamel square before the label; the selected filter fills with the issue's enamel and the square turns to issue ink.

### Issue Tiles (notice builder)
A 2px-bordered option with a 40px icon tile in the issue's enamel. Icons are 24px SVG line glyphs in one 2px stroke, drawn in the current text colour and hidden from screen readers. Selecting a tile fills it with the enamel and inverts the icon tile.

### Inputs / Fields
- **Style:** Board White, 2px Hover Rule border, 3px radius, padding 10px 12px, minimum height 48px, system font.
- **Focus:** border turns Focus Blue with a 3px 25% halo.
- **Disabled:** Wall Shade fill, muted text.

### Navigation
- **Top bar:** an Enamel Black sign bar (pure black in dark mode, with a 1px rule). Brand mark is a light 30px tile with the double-T glyph; the name is in block caps at 1.2rem with a small sub-line. A back link and badges use tracked caps. "Quick exit" is always visible: a light 3px-radius plate with black block caps, 40px tall.
- **Building links:** on the home page each saved building is a small street sign with a right arrow that nudges 3px on hover.
- **Tool list:** each row is the whole link, a 1.3rem block-caps name, a one-line note, and a right arrow, separated by 1px rules.

### Timeline and Disclosures
Timeline entries are a two-column grid: block-caps dates (6.5rem column, tabular) and plain-language labels, with a 2px rule above the first entry and 1px rules between the rest. Disclosures (helper cards) use a block-caps summary with a CSS chevron drawn in a 2.5px stroke that rotates when open (200ms).

### Motion
One motion moment. When "Me too" lands, the count is painted sign yellow for an instant and fades back over 1.4s (`cubic-bezier(0.16, 1, 0.3, 1)`). Other state changes are 160ms colour transitions. Under `prefers-reduced-motion`, animations and transitions are cut to near zero.

## Do's and Don'ts

### Do:
- **Do** give each screen at most one Chrome Sign Yellow board, and only for a step the resident can take now.
- **Do** key every issue colour through `data-issue` so the hue matches across rows, filters, tiles, and plates.
- **Do** set h1 to h4, labels, buttons, and numerals in Big Shoulders caps; set every sentence in the system font.
- **Do** separate sections with a 2px Enamel Black rule and divide list items with 1px light rules.
- **Do** keep corners between 2px and 6px, except street-sign blades, whose corners scale with their lettering, and keep touch targets at least 48px (40px for compact buttons and tags).
- **Do** set a building address that names a page or links to a building as a street sign, with the hundred-block on its own plate.
- **Do** draw a problem's steps as the six-stop line in its enamel, coloured only between reached stops.
- **Do** paint the same signs on Night Board in dark mode, using the lighter enamel steps from `base.css`.
- **Do** honour `prefers-reduced-motion` and keep print output black on white with the rules intact.

### Don't:
- **Don't** use yellow for warnings, highlights, badges, or decoration; warnings are a Wall Shade board with a black rule.
- **Don't** wrap content in four-sided cards or add resting shadows.
- **Don't** use gradients, glass, or backdrop blur, and don't put a hard offset shadow on any box; the drop shade belongs to one heading's lettering per page.
- **Don't** use street-sign green for a problem type, a status, or an action.
- **Don't** add the City of Chicago star, a CTA logo, or any seal or mark that implies City affiliation.
- **Don't** set body sentences in Big Shoulders; it does not cover the languages the notices use.
- **Don't** add motion beyond the "Me too" count bump and short colour transitions.
- **Don't** introduce a new issue hue without adding it to the enamel set in `base.css` for both light and dark.
