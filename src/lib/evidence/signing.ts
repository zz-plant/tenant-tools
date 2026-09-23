import { timingSafeEqual } from "../access";

/** Signed evidence links expire quickly. A copied link stops working after this time. */
export const EVIDENCE_URL_TTL_SECONDS = 5 * 60;

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");

const hmac = async (secret: string, message: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
};

const signedMessage = (submissionId: string, evidenceId: string, expiresAt: number) =>
  `evidence:${submissionId}:${evidenceId}:${expiresAt}`;

export const buildSignedEvidenceUrl = async (
  secret: string,
  submissionId: string,
  evidenceId: string,
  nowMs = Date.now()
) => {
  const expiresAt = Math.floor(nowMs / 1000) + EVIDENCE_URL_TTL_SECONDS;
  const signature = await hmac(secret, signedMessage(submissionId, evidenceId, expiresAt));
  return `/api/submissions/${encodeURIComponent(submissionId)}/evidence/${encodeURIComponent(evidenceId)}?exp=${expiresAt}&sig=${signature}`;
};

export const verifyEvidenceSignature = async (
  secret: string,
  submissionId: string,
  evidenceId: string,
  expiresAtRaw: string | null,
  signature: string | null,
  nowMs = Date.now()
) => {
  const expiresAt = Number(expiresAtRaw);
  if (!secret || !signature || !Number.isInteger(expiresAt)) {
    return false;
  }
  if (expiresAt < Math.floor(nowMs / 1000)) {
    return false;
  }
  const expected = await hmac(secret, signedMessage(submissionId, evidenceId, expiresAt));
  return timingSafeEqual(expected, signature);
};
