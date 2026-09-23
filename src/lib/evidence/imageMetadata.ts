/*
 * Server-side metadata stripping for evidence photos.
 *
 * The browser already re-encodes photos through a canvas, which drops EXIF (GPS, device, time).
 * This is a second layer for uploads that skip the browser step.
 * Only JPEG and PNG are accepted, so only these two formats are handled.
 */

export type EvidenceImageType = "image/jpeg" | "image/png";

export const allowedEvidenceTypes: readonly EvidenceImageType[] = ["image/jpeg", "image/png"];

const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Detects the real file type from its first bytes. The client's Content-Type is not trusted. */
export const detectImageType = (bytes: Uint8Array): EvidenceImageType | null => {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 8 && pngSignature.every((value, index) => bytes[index] === value)) {
    return "image/png";
  }
  return null;
};

const concat = (parts: Uint8Array[]) => {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
};

/**
 * Removes APP1–APP15 segments (EXIF, XMP, IPTC, maker notes) and comments from a JPEG.
 * Keeps APP0 (JFIF) and every segment needed to decode the image.
 */
export const stripJpegMetadata = (bytes: Uint8Array): Uint8Array => {
  if (detectImageType(bytes) !== "image/jpeg") {
    throw new Error("Not a JPEG file.");
  }
  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  let offset = 2;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      throw new Error("Malformed JPEG.");
    }
    // Fill bytes (0xFF) may appear before a marker.
    let markerOffset = offset;
    while (markerOffset < bytes.length && bytes[markerOffset] === 0xff) {
      markerOffset += 1;
    }
    const marker = bytes[markerOffset];
    if (marker === undefined) {
      throw new Error("Malformed JPEG.");
    }
    const segmentStart = markerOffset - 1;

    // Markers without a length field.
    if (marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      parts.push(bytes.subarray(segmentStart, markerOffset + 1));
      offset = markerOffset + 1;
      if (marker === 0xd9) {
        break;
      }
      continue;
    }

    if (markerOffset + 2 >= bytes.length) {
      throw new Error("Malformed JPEG.");
    }
    const length = (bytes[markerOffset + 1] << 8) | bytes[markerOffset + 2];
    if (length < 2) {
      throw new Error("Malformed JPEG.");
    }
    const segmentEnd = markerOffset + 1 + length;
    if (segmentEnd > bytes.length) {
      throw new Error("Malformed JPEG.");
    }

    // Start of scan: the rest is compressed image data. Keep it all.
    if (marker === 0xda) {
      parts.push(bytes.subarray(segmentStart));
      break;
    }

    const isMetadata = (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;
    if (!isMetadata) {
      parts.push(bytes.subarray(segmentStart, segmentEnd));
    }
    offset = segmentEnd;
  }

  return concat(parts);
};

const pngMetadataChunks = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "tIME"]);

/** Removes text, EXIF, and timestamp chunks from a PNG. Image chunks are copied unchanged. */
export const stripPngMetadata = (bytes: Uint8Array): Uint8Array => {
  if (detectImageType(bytes) !== "image/png") {
    throw new Error("Not a PNG file.");
  }
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  let offset = 8;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    const chunkEnd = offset + 12 + length;
    if (chunkEnd > bytes.length) {
      throw new Error("Malformed PNG.");
    }
    if (!pngMetadataChunks.has(type)) {
      parts.push(bytes.subarray(offset, chunkEnd));
    }
    offset = chunkEnd;
    if (type === "IEND") {
      break;
    }
  }

  return concat(parts);
};

export const stripImageMetadata = (bytes: Uint8Array, type: EvidenceImageType) =>
  type === "image/jpeg" ? stripJpegMetadata(bytes) : stripPngMetadata(bytes);
