import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildGroupTools } from "../src/lib/navigation";
import { builderContactsLimit, loadBuilderNoticeContacts, saveNoticeContacts } from "../src/lib/storage/noticeContacts";
import { lintVerySimpleEnglish } from "../src/lib/copyLint";
import { asKv, createMockKv } from "./helpers/mockKv";

describe("group tools on the building dashboard", () => {
  it("gives residents the group tools and the rights guide, and no steward tools", () => {
    const tools = buildGroupTools("2400 W Wabansia", false);
    assert.deepEqual(
      tools.map((tool) => tool.href),
      [
        "/buildings/2400%20W%20Wabansia/meeting",
        "/buildings/2400%20W%20Wabansia/letter",
        "/buildings/2400%20W%20Wabansia/311",
        "/buildings/2400%20W%20Wabansia/export",
        "/rights",
      ]
    );
  });

  it("adds canvass, notice contacts, and steward tools for a steward", () => {
    const hrefs = buildGroupTools("2400 W Wabansia", true).map((tool) => tool.href);
    assert.ok(hrefs.includes("/buildings/2400%20W%20Wabansia/canvass"));
    assert.ok(hrefs.includes("/buildings/2400%20W%20Wabansia/contacts"));
    assert.ok(hrefs.includes("/steward"));
  });

  it("has short, literal labels for the row of links on phones", () => {
    buildGroupTools("2400 W Wabansia", true).forEach((tool) => {
      assert.ok(tool.short.length <= 24, tool.short);
      assert.deepEqual(lintVerySimpleEnglish(`${tool.label}. ${tool.note}`).warnings, [], tool.label);
    });
  });
});

describe("Send it to: notice contacts in the builder", () => {
  const card = { owner: "2400 Building LLC", noticeAddress: "100 N Main St, Suite 400, Chicago, IL", updatedAt: "2026-10-20" };

  it("reads nothing without a key", async () => {
    const kv = createMockKv();
    await saveNoticeContacts(asKv(kv), "2400 W Wabansia", card);
    kv.resetReads();
    assert.deepEqual(await loadBuilderNoticeContacts(asKv(kv), [], ["2400 W Wabansia"]), {});
    assert.equal(kv.getCallCount(), 0);
  });

  it("loads only the buildings the key unlocks", async () => {
    const kv = createMockKv();
    await saveNoticeContacts(asKv(kv), "2400 W Wabansia", card);
    await saveNoticeContacts(asKv(kv), "2353 W Wabansia", { ...card, owner: "Other LLC" });
    const cards = await loadBuilderNoticeContacts(asKv(kv), ["2400 W Wabansia"], ["2400 W Wabansia", "2353 W Wabansia"]);
    assert.deepEqual(Object.keys(cards), ["2400 W Wabansia"]);
    assert.deepEqual(cards["2400 W Wabansia"], {
      lines: [
        { label: "Owner", value: "2400 Building LLC" },
        { label: "Address for written notices", value: "100 N Main St, Suite 400, Chicago, IL" },
      ],
      updatedAt: "2026-10-20",
    });
  });

  it("reads the listed buildings for a key to every building, up to the limit", async () => {
    const kv = createMockKv();
    const listed = Array.from({ length: builderContactsLimit + 5 }, (_, index) => `${100 + index} W Example St`);
    kv.resetReads();
    await loadBuilderNoticeContacts(asKv(kv), ["*"], listed);
    assert.equal(kv.getCallCount(), builderContactsLimit);
  });

  it("leaves out a building whose read fails", async () => {
    const kv = createMockKv();
    await saveNoticeContacts(asKv(kv), "2400 W Wabansia", card);
    const failing = {
      ...asKv(kv),
      get: async () => {
        throw new Error("KV unavailable");
      },
    } as unknown as KVNamespace;
    assert.deepEqual(await loadBuilderNoticeContacts(failing, ["2400 W Wabansia"], []), {});
  });
});

describe("offline copy of the home page", () => {
  it("is fetched without cookies, so it never holds a resident's building or contacts", () => {
    const worker = readFileSync("public/sw.js", "utf8");
    assert.match(worker, /new Request\(path, \{ credentials: "omit" \}\)/);
    // The cache name changed, so copies saved with cookies by older versions are deleted.
    assert.doesNotMatch(worker, /building-ledger-v3"/);
  });
});
