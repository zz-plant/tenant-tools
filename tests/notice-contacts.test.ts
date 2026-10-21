import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { listNoticeContactLines, parseNoticeContacts, validateNoticeContactsInput } from "../src/lib/noticeContacts";
import { DELETE as clearContacts, POST as saveContacts } from "../src/pages/api/buildings/contacts";
import { GET as exportData } from "../src/pages/api/steward/export";
import { getNoticeContacts } from "../src/lib/storage/noticeContacts";
import { wipeBuildingBatch } from "../src/lib/buildingData";
import { asKv, createMockKv } from "./helpers/mockKv";

const today = "2026-10-21";

describe("validateNoticeContactsInput", () => {
  it("keeps filled business lines, a suite number, and the source", () => {
    const result = validateNoticeContactsInput(
      { owner: " 2400 Building LLC ", manager: "", noticeAddress: "100 N Main St, Suite 400, Chicago, IL", source: "lease", extra: "x" },
      today
    );
    assert.deepEqual(result, {
      ok: true,
      data: { updatedAt: today, owner: "2400 Building LLC", noticeAddress: "100 N Main St, Suite 400, Chicago, IL", source: "lease" },
    });
  });

  it("rejects email addresses, phone numbers, an empty card, and unknown sources", () => {
    assert.equal(validateNoticeContactsInput({ manager: "jane@example.com" }, today).ok, false);
    assert.equal(validateNoticeContactsInput({ noticeAddress: "Call 773-555-0100" }, today).ok, false);
    assert.equal(validateNoticeContactsInput({ owner: "  " }, today).ok, false);
    assert.equal(validateNoticeContactsInput({ owner: "LLC", source: "rumor" }, today).ok, false);
    assert.equal(validateNoticeContactsInput(null, today).ok, false);
  });

  it("cuts long lines to 100 characters", () => {
    const result = validateNoticeContactsInput({ owner: "x".repeat(150) }, today);
    assert.ok(result.ok && result.data.owner?.length === 100);
  });
});

describe("notice contacts display", () => {
  it("reads stored cards defensively and lists lines in order", () => {
    assert.equal(parseNoticeContacts({ owner: "A LLC" }), null);
    assert.equal(parseNoticeContacts({ updatedAt: today }), null);
    const parsed = parseNoticeContacts({ updatedAt: today, portal: "Portal Co", owner: "A LLC", source: "nope" });
    assert.deepEqual(parsed, { updatedAt: today, owner: "A LLC", portal: "Portal Co" });
    assert.deepEqual(listNoticeContactLines(parsed!), [
      { label: "Owner", value: "A LLC" },
      { label: "Rent or repair portal", value: "Portal Co" },
    ]);
  });
});

describe("notice contacts API", () => {
  const kv = createMockKv();
  const locals = { env: { SUBMISSIONS_KV: kv, STEWARD_KEY: "steward", BUILDING_KEYS_JSON: JSON.stringify({ "2400 W Wabansia": "key-2400" }) } };
  let ip = 0;
  const call = (handler: unknown, method: string, body: unknown, headers: Record<string, string>, url = "/api/buildings/contacts") =>
    (handler as (context: never) => Promise<Response>)({
      params: {},
      request: new Request(`http://localhost${url}`, {
        method,
        headers: { "Content-Type": "application/json", "x-forwarded-for": `7.7.7.${ip++}`, ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      locals,
    } as never);

  it("lets stewards save, export, wipe, and clear the card, and residents cannot save it", async () => {
    const body = { building: "2400 W Wabansia", owner: "2400 Building LLC", manager: "Main Street Property Management" };
    assert.equal((await call(saveContacts, "POST", body, { "x-building-key": "key-2400" })).status, 403);

    assert.equal((await call(saveContacts, "POST", body, { "x-steward-key": "steward" })).status, 201);
    assert.equal((await getNoticeContacts(asKv(kv), "2400 W Wabansia"))?.owner, "2400 Building LLC");
    assert.ok(kv.keys().every((key) => !key.includes("Wabansia")), "keys never show the address");

    const exported = await call(exportData, "GET", undefined, { "x-steward-key": "steward" }, "/api/steward/export?building=2400%20W%20Wabansia");
    assert.equal(JSON.parse(await exported.text()).noticeContacts.manager, "Main Street Property Management");

    assert.equal((await call(clearContacts, "DELETE", { building: "2400 W Wabansia" }, { "x-steward-key": "steward" })).status, 200);
    assert.equal(await getNoticeContacts(asKv(kv), "2400 W Wabansia"), null);

    await call(saveContacts, "POST", body, { "x-steward-key": "steward" });
    await wipeBuildingBatch(asKv(kv), null, "2400 W Wabansia");
    assert.equal(await getNoticeContacts(asKv(kv), "2400 W Wabansia"), null, "the emergency wipe clears the card");
  });
});
