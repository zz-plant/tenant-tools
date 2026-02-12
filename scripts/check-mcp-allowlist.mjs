#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { docsMcpAllowlist } from "../src/lib/mcpDocs.ts";

const root = process.cwd();
const allowedPrefixes = ["docs/", "skills/", "README.md", "AGENTS.md"];

const errors = [];
for (const relativePath of docsMcpAllowlist) {
  const hasAllowedPrefix = allowedPrefixes.some((prefix) =>
    prefix.endsWith("/") ? relativePath.startsWith(prefix) : relativePath === prefix
  );
  if (!hasAllowedPrefix) {
    errors.push(`Path not in allowed prefixes: ${relativePath}`);
    continue;
  }

  const absolutePath = path.resolve(root, relativePath);
  if (!absolutePath.startsWith(root)) {
    errors.push(`Path escapes repository root: ${relativePath}`);
    continue;
  }

  if (!fs.existsSync(absolutePath)) {
    errors.push(`Allowlisted file missing: ${relativePath}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log(`MCP docs allowlist verified (${docsMcpAllowlist.length} files).`);
