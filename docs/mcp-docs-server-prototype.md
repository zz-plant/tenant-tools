# Docs MCP server prototype (P2)

This repository now includes a local prototype server for contributor agents.

## Safety constraints

- Read-only resource access.
- Explicit allowlist in `src/lib/mcpDocs.ts`.
- No resident data paths are exposed.
- Maintenance tools deny by default when context is missing.
- Maintenance outputs are aggregate-only and do not return raw evidence.

## Files

- Server entry: `scripts/mcp-docs-server.mjs`
- Allowlist + resource readers: `src/lib/mcpDocs.ts`
- Maintenance tools: `src/lib/maintenanceTools.ts`
- Allowlist checker: `scripts/check-mcp-allowlist.mjs`

## Supported request methods

- `resources/list`
- `resources/read`
- `tools/list`
- `tools/call`

## Available tool calls

- `run_access_audit`
- `validate_notice_copy`

## CI / local verification

Run:

```bash
npm run check:mcp-allowlist
```

The command fails if an allowlisted file is missing or outside approved doc/skill policy locations.
