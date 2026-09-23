import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST as createSubmission } from "../src/pages/api/submissions/index";
import { POST as reportSubmission } from "../src/pages/api/submissions/[id]/report";
import { POST as mergeSubmission } from "../src/pages/api/submissions/[id]/merge";
import { fetchSubmissionRecord } from "../src/lib/storage/submissions";
import { asKv, createMockKv } from "./helpers/mockKv";

const BUILDING_KEYS_JSON = JSON.stringify({ "2400 W Wabansia": "key-2400", "2353 W Wabansia": "key-2353" });
const STEWARD_KEY = "steward-test";

const payloadFor = (building: string) => ({
  building,
  issue: "common",
  stage: "A",
  language: "en",
  portfolio: "other",
  startDate: "2026-09-01",
  reportDate: "2026-09-02",
  reportCount: 1,
  simpleEnglish: true,
  zone: "entry",
  issueDetails: {},
});

const setup = () => {
  const kv = createMockKv();
  const locals = { runtime: { env: { SUBMISSIONS_KV: kv, BUILDING_KEYS_JSON, STEWARD_KEY } } };
  let ip = 0;
  const create = async (building: string, key: string) => {
    const response = await createSubmission({
      request: new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-building-key": key, "x-forwarded-for": `4.4.4.${ip++}` },
        body: JSON.stringify(payloadFor(building)),
      }),
      locals,
    } as unknown as Parameters<typeof createSubmission>[0]);
    return (JSON.parse(await response.text()) as { id: string }).id;
  };
  const meToo = async (id: string, session: string) =>
    reportSubmission({
      params: { id },
      request: new Request(`http://localhost/api/submissions/${id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-building-key": "key-2400",
          "x-forwarded-for": `5.5.5.${ip++}`,
          cookie: `bl_session_id=${session}`,
        },
        body: "{}",
      }),
      locals,
    } as unknown as Parameters<typeof reportSubmission>[0]);
  const merge = async (id: string, into: string, stewardKey = STEWARD_KEY) =>
    mergeSubmission({
      params: { id },
      request: new Request(`http://localhost/api/submissions/${id}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-steward-key": stewardKey, "x-forwarded-for": `6.6.6.${ip++}` },
        body: JSON.stringify({ into }),
      }),
      locals,
    } as unknown as Parameters<typeof mergeSubmission>[0]);
  return { kv, create, meToo, merge };
};

describe("steward merge", () => {
  it("moves reports to the main record and archives the duplicate", async () => {
    const { kv, create, meToo, merge } = setup();
    const main = await create("2400 W Wabansia", "key-2400");
    const duplicate = await create("2400 W Wabansia", "key-2400");
    await meToo(duplicate, "d1");
    await meToo(duplicate, "d2");
    await meToo(main, "m1");

    const response = await merge(duplicate, main);
    assert.equal(response.status, 200);
    const body = JSON.parse(await response.text());
    assert.equal(body.reportCount, 2 + 3);

    const archived = await fetchSubmissionRecord(asKv(kv), duplicate);
    assert.equal(archived?.status, "archived");
    assert.equal(archived?.mergedInto, main);

    // Later taps on the main record keep the merged reports.
    await meToo(main, "m2");
    const updatedMain = await fetchSubmissionRecord(asKv(kv), main);
    assert.equal(updatedMain?.reportCount, 6);

    // Taps on the archived duplicate are refused and point to the main record.
    const refused = await meToo(duplicate, "d3");
    assert.equal(refused.status, 409);
  });

  it("requires the steward key", async () => {
    const { create, merge } = setup();
    const a = await create("2400 W Wabansia", "key-2400");
    const b = await create("2400 W Wabansia", "key-2400");
    assert.equal((await merge(a, b, "wrong")).status, 403);
  });

  it("refuses cross-building, self, and repeat merges", async () => {
    const { create, merge } = setup();
    const a = await create("2400 W Wabansia", "key-2400");
    const b = await create("2400 W Wabansia", "key-2400");
    const other = await create("2353 W Wabansia", "key-2353");
    assert.equal((await merge(a, other)).status, 400);
    assert.equal((await merge(a, a)).status, 400);
    assert.equal((await merge(a, b)).status, 200);
    assert.equal((await merge(a, b)).status, 409);
    assert.equal((await merge(b, a)).status, 409);
  });
});
