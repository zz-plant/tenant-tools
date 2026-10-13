/*
 * Headers added to every page and API response from the Worker.
 * A route that sets its own value keeps it (the evidence route sets a stricter CSP).
 *
 * - No framing: steward pages have key and wipe buttons, so no other site may frame them.
 * - Referrer only to this site: building addresses are in page paths.
 * - No camera, microphone, or location APIs: photos come from the file picker only.
 */
export const securityHeaders: Readonly<Record<string, string>> = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "Referrer-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

export const withSecurityHeaders = (response: Response) => {
  const missing = Object.entries(securityHeaders).filter(([name]) => !response.headers.has(name));
  if (missing.length === 0) {
    return response;
  }
  try {
    missing.forEach(([name, value]) => response.headers.set(name, value));
    return response;
  } catch {
    // Some responses have read-only headers. Copy the response, then add the headers.
    const copy = new Response(response.body, response);
    missing.forEach(([name, value]) => copy.headers.set(name, value));
    return copy;
  }
};
