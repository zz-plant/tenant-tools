import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatPublicReadonlyCount,
  formatResidentReportCount,
  loadBuildingSubmissions,
} from "../src/lib/buildingDashboard";
import { saveSubmissionRecord } from "../src/lib/storage/submissions";
import type { SubmissionRecord } from "../src/lib/submissions";
import { asKv, createMockKv } from "./helpers/mockKv";

describe("resident report count formatting", () => {
  it("shows 0 for invalid and non-positive values", () => {
    assert.equal(formatResidentReportCount(0), "0");
    assert.equal(formatResidentReportCount(-1), "0");
    assert.equal(formatResidentReportCount(Number.NaN), "0");
  });

  it("buckets small counts to reduce identity risk", () => {
    assert.equal(formatResidentReportCount(1), "<3");
    assert.equal(formatResidentReportCount(2), "<3");
  });

  it("shows whole numbers for larger counts", () => {
    assert.equal(formatResidentReportCount(3), "3");
    assert.equal(formatResidentReportCount(8.9), "8");
  });
});


describe("public-readonly count suppression", () => {
  it("suppresses small counts for privacy", () => {
    assert.equal(formatPublicReadonlyCount(1), "Not shown");
    assert.equal(formatPublicReadonlyCount(2), "Not shown");
  });

  it("shows whole numbers when counts are large enough", () => {
    assert.equal(formatPublicReadonlyCount(3), "3");
    assert.equal(formatPublicReadonlyCount(7.8), "7");
  });
});

describe("loadBuildingSubmissions", () => {
  const record = (id: string, building: string): SubmissionRecord => ({
    id,
    building,
    issue: "common",
    issueLabel: "Elevator / common areas",
    stage: "A",
    language: "en",
    portfolio: "other",
    startDate: "2026-09-01",
    reportDate: "2026-09-02",
    reportCount: 4,
    simpleEnglish: true,
    zone: "",
    issueDetails: {},
    createdAt: "2026-09-02T00:00:00.000Z",
    status: "open",
  });

  it("backfills the building index once, then reads only the index", async () => {
    const kv = createMockKv();
    // Older records: saved before list metadata and the index existed.
    await kv.put("submission:a", JSON.stringify(record("a", "2400 W Wabansia")));
    await kv.put("submission:b", JSON.stringify(record("b", "2353 W Wabansia")));

    const first = await loadBuildingSubmissions({ kv: asKv(kv), buildingId: "2400 W Wabansia" });
    assert.deepEqual(first.map((item) => item.id), ["a"]);
    assert.ok(kv.keys().some((key) => key.startsWith("bidx-ready:")));
    assert.ok(!kv.keys().some((key) => key.includes("Wabansia") && !key.startsWith("submission:")));

    kv.resetReads();
    const second = await loadBuildingSubmissions({ kv: asKv(kv), buildingId: "2400 W Wabansia" });
    assert.deepEqual(second.map((item) => item.id), ["a"]);
    assert.equal(second[0].reportCount, 4);
    assert.equal(second[0].issueLabel.includes("Elevator"), true);
    assert.equal(kv.recordReadCount(), 0);
  });

  it("includes records saved after the index is ready", async () => {
    const kv = createMockKv();
    await loadBuildingSubmissions({ kv: asKv(kv), buildingId: "2400 W Wabansia" });
    await saveSubmissionRecord(asKv(kv), record("new", "2400 W Wabansia"));
    await saveSubmissionRecord(asKv(kv), record("other", "2353 W Wabansia"));

    kv.resetReads();
    const results = await loadBuildingSubmissions({ kv: asKv(kv), buildingId: "2400 W Wabansia" });
    assert.deepEqual(results.map((item) => item.id), ["new"]);
    assert.equal(kv.recordReadCount(), 0);
  });
});
