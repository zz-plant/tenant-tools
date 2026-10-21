import React from "react";

/*
 * Problem-type glyphs, drawn in one stroke weight in the current text colour.
 * The tile behind each glyph carries the issue's enamel colour (see [data-issue] in components.css).
 * The card's own label names the problem, so the glyphs are hidden from screen readers.
 */
const Glyph = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

export const issueIcons: Record<string, React.ReactNode> = {
  heat: (
    <Glyph>
      <path d="M10 13.5V5a2 2 0 0 1 4 0v8.5a4 4 0 1 1-4 0z" />
      <path d="M12 9v6.5" />
    </Glyph>
  ),
  leak: (
    <Glyph>
      <path d="M12 3c3 4.2 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.8 6-11z" />
      <path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5" />
    </Glyph>
  ),
  pests: (
    <Glyph>
      <ellipse cx="12" cy="14" rx="4" ry="6" />
      <path d="M12 8V5M10 5l-2-2M14 5l2-2" />
      <path d="M8 11L4 9M8 15H3.5M8.5 18.5L5 21M16 11l4-2M16 15h4.5M15.5 18.5L19 21" />
    </Glyph>
  ),
  entry: (
    <Glyph>
      <path d="M4 21h16" />
      <path d="M6 21V3h12v18" />
      <path d="M6 3l7 2.5V21" />
      <path d="M10.5 12.5v.01" />
    </Glyph>
  ),
  common: (
    <Glyph>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M12 3v18" />
      <path d="M8 10l-1.5 1.5M8 10l1.5 1.5M8 10v4" />
      <path d="M16 14l-1.5-1.5M16 14l1.5-1.5M16 14v-4" />
    </Glyph>
  ),
  "no-timeline": (
    <Glyph>
      <rect x="3.5" y="5" width="17" height="15" rx="1" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M10 13.5l4 4M14 13.5l-4 4" />
    </Glyph>
  ),
  deposit: (
    <Glyph>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.5 9.5c-.5-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.1 0-2-.5-2.5-1.5" />
      <path d="M12 6.5V8M12 16v1.5" />
    </Glyph>
  ),
  lockout: (
    <Glyph>
      <rect x="5" y="11" width="14" height="10" rx="1" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M12 15v2" />
    </Glyph>
  ),
  building: (
    <Glyph>
      <path d="M3 21h18" />
      <path d="M5 21V4h14v17" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
    </Glyph>
  ),
};
