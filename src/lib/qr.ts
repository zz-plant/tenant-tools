import qrcode from "qrcode-generator";

/** SVG QR code for a public link. Never pass a link that holds a key. */
export const qrSvg = (url: string) => {
  if (/[?&](key|stewardKey)=/i.test(url)) {
    throw new Error("QR codes must not contain keys.");
  }
  const code = qrcode(0, "M");
  code.addData(url);
  code.make();
  return code.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
};
