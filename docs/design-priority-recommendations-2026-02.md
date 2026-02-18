# Graphic design priorities (recommended order)

This list prioritizes design changes by user impact, clarity, and implementation effort.

## 1) Add one clear primary action in the intro panel (highest)
- Add a single primary button in the top intro section.
- Suggested label: "Start a new issue".
- Keep it visible on mobile and desktop.

Why first:
- The top section explains the product well, but does not present one strong visual next step.
- A clear action reduces hesitation for first-time users.

## 2) Strengthen visual hierarchy in the top panel
- Increase distinction between the first panel and standard content cards.
- Use one accent treatment only (for example: stronger heading scale or subtle accent background).
- Keep the tone calm and neutral.

Why second:
- The first panel currently looks close to surrounding card styles.
- Better hierarchy improves scanning and orientation.

## 3) Increase contrast for small helper and metadata text
- Darken secondary text slightly in small sizes.
- Keep body text and labels readable on low-quality mobile displays.
- Recheck contrast across helper text, status text, and secondary labels.

Why third:
- Readability improvements help all users, especially under stress and in poor lighting.

## 4) Consolidate color and surface tokens
- Move repeated color values into semantic variables.
- Suggested tokens: `--surface-base`, `--surface-raised`, `--surface-interactive`, `--text-primary`, `--text-secondary`, `--border-subtle`, `--accent-primary`.
- Replace hardcoded values progressively.

Why fourth:
- This improves consistency and prevents style drift as features grow.
- It lowers cost for later accessibility tuning.

## 5) Standardize interaction states across selectable cards
- Align hover, active, and focus behavior for:
  - step buttons
  - building cards
  - issue option cards
- Keep one shared interaction model with clear selected state.

Why fifth:
- It improves perceived polish and predictability.

## 6) Reduce visual noise from repeated soft shadows
- Keep shadows subtle and use fewer shadow variants.
- Prefer border + background differentiation for most cards.

Why sixth:
- A simpler elevation system improves clarity and lowers visual clutter.

## 7) Tune spacing rhythm with a small scale
- Apply a consistent spacing scale (for example: 4/8/12/16/24/32).
- Audit mixed values and normalize gradually.

Why seventh:
- Spacing consistency makes dense forms easier to scan.

## 8) Create a short design QA checklist for each UI PR
- Include checks for:
  - CTA visibility in first viewport
  - contrast of small text
  - selected/focus state consistency
  - mobile readability at narrow widths

Why eighth:
- It keeps improvements from regressing over time.

## Suggested implementation sequence
1. Primary intro CTA and hierarchy update
2. Contrast update for small text
3. Shared interaction state cleanup
4. Tokenization and spacing normalization
5. Ongoing QA checklist enforcement
