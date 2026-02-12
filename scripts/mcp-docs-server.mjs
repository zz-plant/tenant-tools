#!/usr/bin/env node
import readline from "node:readline";
import { listDocsResources, readAllowedDocsResource } from "../src/lib/mcpDocs.ts";
import { runAccessAudit, validateNoticeCopy } from "../src/lib/maintenanceTools.ts";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const writeMessage = (message) => {
  process.stdout.write(`${JSON.stringify(message)}\n`);
};

const handlers = {
  "resources/list": async () => ({ resources: listDocsResources() }),
  "resources/read": async (params) => {
    const result = await readAllowedDocsResource(String(params?.uri || ""));
    return result.ok ? { contents: [{ uri: params?.uri, text: result.text }] } : result;
  },
  "tools/list": async () => ({
    tools: [
      { name: "run_access_audit", description: "Aggregated route gate audit. Denies without context." },
      { name: "validate_notice_copy", description: "Validate template copy safety. Returns warning codes only." },
    ],
  }),
  "tools/call": async (params) => {
    const toolName = String(params?.name || "");
    if (toolName === "run_access_audit") {
      return runAccessAudit(params?.arguments?.entries);
    }
    if (toolName === "validate_notice_copy") {
      return validateNoticeCopy(params?.arguments?.templateId, params?.arguments?.text);
    }
    return { ok: false, error: "Unknown tool." };
  },
};

rl.on("line", async (line) => {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    writeMessage({ id: null, error: "Invalid JSON." });
    return;
  }

  const id = message?.id ?? null;
  const method = String(message?.method || "");
  const handler = handlers[method];
  if (!handler) {
    writeMessage({ id, error: "Unsupported method." });
    return;
  }

  try {
    const result = await handler(message?.params || {});
    writeMessage({ id, result });
  } catch {
    writeMessage({ id, error: "Server error." });
  }
});
