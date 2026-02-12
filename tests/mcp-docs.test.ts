import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildDocsResourceUri,
  isAllowedDocsPath,
  listDocsResources,
  parseDocsResourceUri,
  readAllowedDocsResource,
} from "../src/lib/mcpDocs";

describe("docs MCP allowlist", () => {
  it("lists resources with docs:// URIs", () => {
    const resources = listDocsResources();
    assert.ok(resources.length > 0);
    for (const resource of resources) {
      assert.equal(resource.uri.startsWith("docs://"), true);
      assert.equal(isAllowedDocsPath(resource.path), true);
    }
  });

  it("rejects non-allowlisted resources", async () => {
    const result = await readAllowedDocsResource("docs://package.json");
    assert.equal(result.ok, false);
  });

  it("reads allowlisted resources", async () => {
    const uri = buildDocsResourceUri("README.md");
    const result = await readAllowedDocsResource(uri);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.path, "README.md");
      assert.ok(result.text.includes("Building Ledger"));
    }
  });

  it("normalizes URI paths", () => {
    const parsed = parseDocsResourceUri("docs://./docs/../docs/vision.md");
    assert.equal(parsed, "docs/vision.md");
  });
});
