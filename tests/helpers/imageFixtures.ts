export const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0));

const segment = (marker: number, payload: number[]) => {
  const length = payload.length + 2;
  return [0xff, marker, length >> 8, length & 0xff, ...payload];
};

/** A structurally valid JPEG with JFIF, EXIF (with a fake GPS tag), a comment, and scan data. */
export const buildJpegWithExif = () =>
  Uint8Array.from([
    0xff, 0xd8,
    ...segment(0xe0, [...ascii("JFIF"), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]),
    ...segment(0xe1, [...ascii("Exif"), 0, 0, ...ascii("GPS 41.91N 87.69W")]),
    ...segment(0xfe, ascii("taken by resident")),
    ...segment(0xdb, [0, ...new Array(64).fill(1)]),
    ...segment(0xda, [1, 1, 0, 0, 0x3f, 0]),
    0x12, 0x34, 0xff, 0x00, 0x56,
    0xff, 0xd9,
  ]);

const crcPlaceholder = [0, 0, 0, 0];
const chunk = (type: string, data: number[]) => [
  (data.length >>> 24) & 0xff, (data.length >>> 16) & 0xff, (data.length >>> 8) & 0xff, data.length & 0xff,
  ...ascii(type),
  ...data,
  ...crcPlaceholder,
];

export const buildPngWithText = () =>
  Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...chunk("IHDR", [0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]),
    ...chunk("tEXt", ascii("Author\u0000Resident Name")),
    ...chunk("eXIf", ascii("GPS")),
    ...chunk("IDAT", [1, 2, 3]),
    ...chunk("IEND", []),
  ]);
