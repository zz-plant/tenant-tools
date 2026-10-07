import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { helpResourceGroups, helpResourcesLastReviewed, toTelHref } from "../src/data/helpResources";
import { lintVerySimpleEnglish } from "../src/lib/copyLint";

describe("help resources", () => {
  it("has https links, US phone numbers, and calm text", () => {
    assert.match(helpResourcesLastReviewed, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(helpResourceGroups.length > 0);
    for (const group of helpResourceGroups) {
      for (const text of [group.title, group.note ?? ""]) {
        assert.deepEqual(lintVerySimpleEnglish(text).warnings, [], text);
      }
      for (const item of group.items) {
        assert.ok(item.url.startsWith("https://"), item.url);
        assert.ok(item.description.trim(), item.name);
        assert.deepEqual(lintVerySimpleEnglish(item.description).warnings, [], item.description);
        if (item.phone) {
          assert.match(item.phone, /^\d{3}-\d{3}-\d{4}$/, item.phone);
        }
      }
    }
  });

  it("tells residents to talk to legal aid before changing how they pay rent", () => {
    const unions = helpResourceGroups.find((group) => group.id === "unions");
    assert.ok(unions?.note?.includes("Talk to legal aid before you change how you pay rent."));
  });

  it("builds tel links", () => {
    assert.equal(toTelHref("773-292-4988"), "tel:7732924988");
  });
});
