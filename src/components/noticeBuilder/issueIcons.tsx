import React from "react";

export const issueIcons: Record<string, React.ReactNode> = {
  heat: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Heat issue">
      <path d="M32 10C24 20 40 26 40 38c0 6-4 12-8 12s-8-6-8-12c0-6 4-10 8-16z" fill="#f6b352" />
      <path d="M32 10C24 20 40 26 40 38c0 6-4 12-8 12s-8-6-8-12c0-6 4-10 8-16z" fill="none" stroke="#c46a2a" strokeWidth="2" />
    </svg>
  ),
  leak: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Water leak issue">
      <path d="M32 10C24 22 18 28 18 38a14 14 0 0 0 28 0c0-10-6-16-14-28z" fill="#7bb5ff" />
      <path d="M32 10C24 22 18 28 18 38a14 14 0 0 0 28 0c0-10-6-16-14-28z" fill="none" stroke="#3a6fb0" strokeWidth="2" />
    </svg>
  ),
  pests: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Pest issue">
      <ellipse cx="32" cy="34" rx="10" ry="14" fill="#cfe8c6" stroke="#4a7d4f" strokeWidth="2" />
      <circle cx="26" cy="22" r="4" fill="#cfe8c6" stroke="#4a7d4f" strokeWidth="2" />
      <circle cx="38" cy="22" r="4" fill="#cfe8c6" stroke="#4a7d4f" strokeWidth="2" />
      <path d="M22 40l-8 4M42 40l8 4M22 28l-8-4M42 28l8-4" stroke="#4a7d4f" strokeWidth="2" />
    </svg>
  ),
  entry: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Entry issue">
      <rect x="18" y="12" width="28" height="40" rx="2" fill="#f4d1c5" stroke="#a95b4a" strokeWidth="2" />
      <circle cx="38" cy="32" r="2" fill="#a95b4a" />
      <rect x="14" y="10" width="36" height="44" rx="3" fill="none" stroke="#a95b4a" strokeWidth="2" />
    </svg>
  ),
  common: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Common area issue">
      <rect x="12" y="12" width="40" height="40" rx="4" fill="#d4e1ff" stroke="#4b6fa9" strokeWidth="2" />
      <rect x="20" y="20" width="8" height="8" fill="#ffffff" stroke="#4b6fa9" />
      <rect x="36" y="20" width="8" height="8" fill="#ffffff" stroke="#4b6fa9" />
      <rect x="20" y="34" width="8" height="8" fill="#ffffff" stroke="#4b6fa9" />
      <rect x="36" y="34" width="8" height="8" fill="#ffffff" stroke="#4b6fa9" />
    </svg>
  ),
  "no-timeline": (
    <svg viewBox="0 0 64 64" role="img" aria-label="No timeline issue">
      <rect x="16" y="10" width="32" height="44" rx="4" fill="#f6e2b8" stroke="#b0823e" strokeWidth="2" />
      <path d="M22 24h20M22 32h20M22 40h14" stroke="#b0823e" strokeWidth="2" />
    </svg>
  ),
  deposit: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Deposit issue">
      <circle cx="32" cy="32" r="16" fill="#ffe3a3" stroke="#b67a2b" strokeWidth="2" />
      <path d="M28 26h8v12h-8z" fill="#b67a2b" />
      <path d="M32 22v20" stroke="#b67a2b" strokeWidth="2" />
    </svg>
  ),
  lockout: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Lockout issue">
      <rect x="18" y="28" width="28" height="22" rx="4" fill="#f0ccd1" stroke="#9a4454" strokeWidth="2" />
      <path d="M24 28v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#9a4454" strokeWidth="2" />
      <circle cx="32" cy="38" r="3" fill="#9a4454" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Building-wide issue">
      <rect x="14" y="14" width="36" height="36" rx="4" fill="#dfe9f5" stroke="#5a7aa6" strokeWidth="2" />
      <rect x="22" y="22" width="6" height="6" fill="#ffffff" stroke="#5a7aa6" />
      <rect x="36" y="22" width="6" height="6" fill="#ffffff" stroke="#5a7aa6" />
      <rect x="22" y="34" width="6" height="6" fill="#ffffff" stroke="#5a7aa6" />
      <rect x="36" y="34" width="6" height="6" fill="#ffffff" stroke="#5a7aa6" />
    </svg>
  ),
};
