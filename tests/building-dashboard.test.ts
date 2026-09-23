import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatPublicReadonlyCount,
  formatResidentReportCount,
  loadBuildingSubmissions,
} from "../src/lib/buildingDashboard";
import { saveSubmissionRecord } from "../src/lib/storage/submissions";

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
  const createListKv = () => {
    const store = new Map<string, { value: string; metadata?: unknown }>();
    let getCalls = 0;
    const kv = {
      async get(key: string) {
        getCalls += 1;
        const entry = store.get(key);
        return entry ? JSON.parse(entry.value) : null;
      },
      async put(key: string, value: string, options: { metadata?: unknown } = {}) {
        store.set(key, { value, metadata: options.metadata });
      },
      async list({ prefix }: { prefix: string }) {
        const keys = [...store.entries()]
          .filter(([name]) => name.startsWith(prefix))
          .map(([name, entry]) => ({ name, metadata: entry.metadata }));
        return { keys, list_complete: true };
      },
      getCallCount: () => getCalls,
    };
    return kv;
  };

  const record = (id: string, building: string) => ({
    id,
    building,
    issue: "common",
    issueLabel: "Elevator / common areas",
    startDate: "2026-09-01",
    reportDate: "2026-09-02",
    reportCount: 4,
    createdAt: "2026-09-02T00:00:00.000Z",
    status: "open",
  });

  it("uses list metadata and skips reads for other buildings", async () => {
    const kv = createListKv();
    await saveSubmissionRecord(kv as unknown as KVNamespace, record("a", "2400 W Wabansia"));
    await saveSubmissionRecord(kv as unknown as KVNamespace, record("b", "2353 W Wabansia"));

    const results = await loadBuildingSubmissions({ kv, buildingId: "2400 W Wabansia" });
    assert.equal(results.length, 1);
    assert.equal(results[0].id, "a");
    assert.equal(results[0].reportCount, 4);
    assert.equal(kv.getCallCount(), 0);
  });

  it("falls back to a read for records saved without metadata", async () => {
    const kv = createListKv();
    await kv.put("submission:legacy", JSON.stringify(record("legacy", "2400 W Wabansia")));

    const results = await loadBuildingSubmissions({ kv, buildingId: "2400 W Wabansia" });
    assert.equal(results.length, 1);
    assert.equal(results[0].id, "legacy");
    assert.equal(kv.getCallCount(), 1);
  });
});
