import fs from "node:fs/promises";
import path from "node:path";

export const docsMcpAllowlist = [
  "AGENTS.md",
  "README.md",
  "docs/architecture.md",
  "docs/security-checklist.md",
  "docs/testing.md",
  "docs/vision.md",
  "docs/priority-feature-roadmap-2026-02.md",
  "docs/mcp-agent-skills-research-2026-02.md",
  "docs/agent-skills-playbook.md",
  "skills/building-ledger-agent/SKILL.md",
  "skills/building-ledger-copy-review/SKILL.md",
  "skills/building-ledger-security-review/SKILL.md",
  "skills/building-ledger-release-note/SKILL.md",
] as const;

export type DocsMcpPath = (typeof docsMcpAllowlist)[number];

const allowlistSet = new Set<string>(docsMcpAllowlist);

const normalizeRelativePath = (relativePath: string) =>
  path.posix
    .normalize(relativePath.replace(/\\/g, "/"))
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");

export const isAllowedDocsPath = (relativePath: string) => {
  const normalized = normalizeRelativePath(relativePath);
  return allowlistSet.has(normalized);
};

export const buildDocsResourceUri = (relativePath: string) => `docs://${normalizeRelativePath(relativePath)}`;

export const parseDocsResourceUri = (uri: string) => {
  if (!uri.startsWith("docs://")) {
    return null;
  }
  const parsed = normalizeRelativePath(uri.slice("docs://".length));
  return parsed || null;
};

export const listDocsResources = () =>
  docsMcpAllowlist.map((relativePath) => ({
    uri: buildDocsResourceUri(relativePath),
    path: relativePath,
  }));

export const readAllowedDocsResource = async (uri: string, rootDir = process.cwd()) => {
  const relativePath = parseDocsResourceUri(uri);
  if (!relativePath || !isAllowedDocsPath(relativePath)) {
    return {
      ok: false,
      error: "Resource is not allowlisted.",
    } as const;
  }

  const absolutePath = path.resolve(rootDir, relativePath);
  const resolvedRoot = path.resolve(rootDir);
  if (!absolutePath.startsWith(resolvedRoot)) {
    return {
      ok: false,
      error: "Resource path is invalid.",
    } as const;
  }

  try {
    const text = await fs.readFile(absolutePath, "utf8");
    return {
      ok: true,
      path: relativePath,
      text,
    } as const;
  } catch {
    return {
      ok: false,
      error: "Resource file is missing.",
    } as const;
  }
};
