import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  detectImageType,
  stripJpegMetadata,
  stripPngMetadata,
} from "../src/lib/evidence/imageMetadata";
import { buildSignedEvidenceUrl, verifyEvidenceSignature } from "../src/lib/evidence/signing";
import { ascii, buildJpegWithExif, buildPngWithText } from "./helpers/imageFixtures";

const text = (bytes: Uint8Array) => Buffer.from(bytes).toString("latin1");

describe("detectImageType", () => {
  it("uses magic bytes, not names", () => {
    assert.equal(detectImageType(buildJpegWithExif()), "image/jpeg");
    assert.equal(detectImageType(buildPngWithText()), "image/png");
    assert.equal(detectImageType(Uint8Array.from(ascii("%PDF-1.7"))), null);
    assert.equal(detectImageType(Uint8Array.from(ascii("<svg onload=alert(1)>"))), null);
  });
});

describe("stripJpegMetadata", () => {
  it("removes EXIF and comments and keeps image data", () => {
    const input = buildJpegWithExif();
    const output = stripJpegMetadata(input);
    assert.ok(text(input).includes("GPS"));
    assert.ok(!text(output).includes("GPS"));
    assert.ok(!text(output).includes("Exif"));
    assert.ok(!text(output).includes("taken by resident"));
    assert.ok(text(output).includes("JFIF"));
    assert.deepEqual([...output.slice(-7)], [0x12, 0x34, 0xff, 0x00, 0x56, 0xff, 0xd9]);
    assert.equal(detectImageType(output), "image/jpeg");
  });

  it("rejects truncated files", () => {
    const input = buildJpegWithExif();
    assert.throws(() => stripJpegMetadata(input.slice(0, 12)));
  });
});

describe("stripPngMetadata", () => {
  it("removes text and EXIF chunks and keeps image chunks", () => {
    const output = stripPngMetadata(buildPngWithText());
    assert.ok(!text(output).includes("Resident Name"));
    assert.ok(!text(output).includes("eXIf"));
    assert.ok(text(output).includes("IHDR"));
    assert.ok(text(output).includes("IDAT"));
    assert.ok(text(output).includes("IEND"));
  });
});

describe("signed evidence URLs", () => {
  const now = Date.parse("2026-09-23T12:00:00Z");

  it("accepts a fresh signature and rejects tampering or expiry", async () => {
    const url = new URL(await buildSignedEvidenceUrl("secret", "sub-1", "ev-1", now), "http://x");
    const exp = url.searchParams.get("exp");
    const sig = url.searchParams.get("sig");
    assert.equal(await verifyEvidenceSignature("secret", "sub-1", "ev-1", exp, sig, now), true);
    assert.equal(await verifyEvidenceSignature("secret", "sub-1", "ev-2", exp, sig, now), false);
    assert.equal(await verifyEvidenceSignature("other", "sub-1", "ev-1", exp, sig, now), false);
    assert.equal(await verifyEvidenceSignature("secret", "sub-1", "ev-1", String(Number(exp) + 60), sig, now), false);
    assert.equal(await verifyEvidenceSignature("secret", "sub-1", "ev-1", exp, sig, now + 10 * 60 * 1000), false);
    assert.equal(await verifyEvidenceSignature("", "sub-1", "ev-1", exp, sig, now), false);
  });
});
