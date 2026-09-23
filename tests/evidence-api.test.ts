import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST as createSubmission } from "../src/pages/api/submissions/index";
import { GET as listEvidence, POST as uploadEvidence } from "../src/pages/api/submissions/[id]/evidence/index";
import {
  DELETE as deleteEvidence,
  GET as getEvidence,
} from "../src/pages/api/submissions/[id]/evidence/[evidenceId]";
import { fetchSubmissionRecord } from "../src/lib/storage/submissions";
import { asKv, createMockBucket, createMockKv } from "./helpers/mockKv";
import { ascii, buildJpegWithExif, buildPngWithText } from "./helpers/imageFixtures";

const BUILDING_KEYS_JSON = JSON.stringify({ "2400 W Wabansia": "key-2400", "2353 W Wabansia": "key-2353" });

const setup = async (options: { withEvidence?: boolean } = {}) => {
  const kv = createMockKv();
  const bucket = createMockBucket();
  const env: Record<string, unknown> = { SUBMISSIONS_KV: kv, BUILDING_KEYS_JSON, STEWARD_KEY: "steward" };
  if (options.withEvidence !== false) {
    env.EVIDENCE_BUCKET = bucket;
    env.EVIDENCE_SIGNING_KEY = "signing-secret";
  }
  const locals = { runtime: { env } };
  let ip = 0;
  const nextIp = () => `7.7.${Math.floor(ip / 250)}.${ip++ % 250}`;

  const created = await createSubmission({
    request: new Request("http://localhost/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-building-key": "key-2400", "x-forwarded-for": nextIp() },
      body: JSON.stringify({
        building: "2400 W Wabansia",
        issue: "leak",
        stage: "A",
        language: "en",
        portfolio: "other",
        startDate: "2026-09-01",
        reportDate: "2026-09-02",
        reportCount: 1,
        simpleEnglish: true,
        zone: "hallway",
        issueDetails: {},
      }),
    }),
    locals,
  } as unknown as Parameters<typeof createSubmission>[0]);
  const id = (JSON.parse(await created.text()) as { id: string }).id;

  const upload = (bytes: Uint8Array, contentType: string, key: string | null = "key-2400") => {
    const headers: Record<string, string> = { "Content-Type": contentType, "x-forwarded-for": nextIp() };
    if (key) headers["x-building-key"] = key;
    return uploadEvidence({
      params: { id },
      request: new Request(`http://localhost/api/submissions/${id}/evidence`, { method: "POST", headers, body: bytes as unknown as BodyInit }),
      locals,
    } as unknown as Parameters<typeof uploadEvidence>[0]);
  };
  const list = (key: string | null = "key-2400") =>
    listEvidence({
      params: { id },
      request: new Request(`http://localhost/api/submissions/${id}/evidence`, {
        headers: key ? { "x-building-key": key } : {},
      }),
      locals,
    } as unknown as Parameters<typeof listEvidence>[0]);
  const fetchPhoto = (url: string, key: string | null = "key-2400") => {
    const parsed = new URL(url, "http://localhost");
    const evidenceId = parsed.pathname.split("/").pop() as string;
    return getEvidence({
      params: { id, evidenceId },
      request: new Request(parsed.toString(), { headers: key ? { "x-building-key": key } : {} }),
      locals,
    } as unknown as Parameters<typeof getEvidence>[0]);
  };
  const remove = (evidenceId: string, stewardKey: string) =>
    deleteEvidence({
      params: { id, evidenceId },
      request: new Request(`http://localhost/api/submissions/${id}/evidence/${evidenceId}`, {
        method: "DELETE",
        headers: { "x-steward-key": stewardKey, "x-forwarded-for": nextIp() },
      }),
      locals,
    } as unknown as Parameters<typeof deleteEvidence>[0]);

  return { kv, bucket, id, upload, list, fetchPhoto, remove };
};

describe("evidence upload", () => {
  it("stores a stripped copy under a random key and counts it on the record", async () => {
    const { kv, bucket, id, upload } = await setup();
    const response = await upload(buildJpegWithExif(), "image/jpeg");
    assert.equal(response.status, 201);

    const [objectKey] = bucket.keys();
    assert.match(objectKey, /^ev\/[0-9a-f-]{36}$/);
    assert.ok(!objectKey.includes(id));
    const stored = Buffer.from(bucket.bytesOf(objectKey) as Uint8Array).toString("latin1");
    assert.ok(!stored.includes("GPS"));

    const record = await fetchSubmissionRecord(asKv(kv), id);
    assert.equal(record?.evidenceCount, 1);
  });

  it("strips PNG text chunks", async () => {
    const { bucket, upload } = await setup();
    assert.equal((await upload(buildPngWithText(), "image/png")).status, 201);
    const stored = Buffer.from(bucket.bytesOf(bucket.keys()[0]) as Uint8Array).toString("latin1");
    assert.ok(!stored.includes("Resident Name"));
  });

  it("rejects files that are not JPEG or PNG, even with an image content type", async () => {
    const { upload } = await setup();
    assert.equal((await upload(Uint8Array.from(ascii("%PDF-1.7 lease")), "application/pdf")).status, 415);
    assert.equal((await upload(Uint8Array.from(ascii("<svg onload=alert(1)>")), "image/jpeg")).status, 415);
    assert.equal((await upload(buildPngWithText(), "image/jpeg")).status, 415);
  });

  it("rejects files over 5 MB", async () => {
    const { upload } = await setup();
    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    big.set(buildJpegWithExif());
    assert.equal((await upload(big, "image/jpeg")).status, 413);
  });

  it("requires the key for this building", async () => {
    const { upload } = await setup();
    assert.equal((await upload(buildJpegWithExif(), "image/jpeg", null)).status, 403);
    assert.equal((await upload(buildJpegWithExif(), "image/jpeg", "key-2353")).status, 404);
  });

  it("returns 503 when evidence storage is not set up", async () => {
    const { upload, list } = await setup({ withEvidence: false });
    assert.equal((await upload(buildJpegWithExif(), "image/jpeg")).status, 503);
    assert.deepEqual(JSON.parse(await (await list()).text()), { enabled: false, items: [] });
  });
});

describe("evidence viewing", () => {
  it("needs a valid signed link and the resident key", async () => {
    const { upload, list, fetchPhoto } = await setup();
    await upload(buildJpegWithExif(), "image/jpeg");
    const listed = JSON.parse(await (await list()).text()) as { items: Array<{ url: string }> };
    assert.equal(listed.items.length, 1);
    const url = listed.items[0].url;

    const ok = await fetchPhoto(url);
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get("content-type"), "image/jpeg");
    assert.equal(ok.headers.get("cache-control"), "private, no-store");
    assert.equal(ok.headers.get("x-content-type-options"), "nosniff");

    assert.equal((await fetchPhoto(url, null)).status, 403);
    assert.equal((await fetchPhoto(url, "key-2353")).status, 404);
    assert.equal((await fetchPhoto(url.replace(/sig=[0-9a-f]+/, "sig=00"))).status, 403);
    assert.equal((await fetchPhoto(url.replace(/exp=\d+/, "exp=1"))).status, 403);
  });

  it("does not list evidence without the key", async () => {
    const { list } = await setup();
    assert.equal((await list(null)).status, 403);
  });
});

describe("evidence delete", () => {
  it("is steward-only and removes the file and the count", async () => {
    const { kv, bucket, id, upload, remove } = await setup();
    const uploaded = JSON.parse(await (await upload(buildJpegWithExif(), "image/jpeg")).text()) as { id: string };

    assert.equal((await remove(uploaded.id, "wrong")).status, 403);
    assert.equal((await remove(uploaded.id, "steward")).status, 200);
    assert.equal(bucket.keys().length, 0);
    assert.equal((await fetchSubmissionRecord(asKv(kv), id))?.evidenceCount, 0);
  });
});
