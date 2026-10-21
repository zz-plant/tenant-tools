/**
 * Old addresses that still reach this Worker and should send visitors to the site's own address.
 * galina.kanav.net was the first address; it named a person, so the site moved to tenants.kanav.net.
 * A self-hosted copy can leave this list empty.
 */
export const legacyHosts: readonly string[] = ["galina.kanav.net"];

/**
 * The address to send a request to, or null to serve it here. Path and query are kept, so a shared
 * resident link (with its ?key=) still works after the move. GET and HEAD get a permanent 301;
 * anything else gets 308, which keeps the method and body.
 */
export const canonicalRedirect = (
  requestUrl: URL,
  method: string,
  siteUrl: string | undefined,
  hosts: readonly string[] = legacyHosts
): { location: string; status: 301 | 308 } | null => {
  if (!siteUrl || !hosts.includes(requestUrl.hostname)) {
    return null;
  }
  const site = new URL(siteUrl);
  if (site.hostname === requestUrl.hostname) {
    return null;
  }
  const location = new URL(`${requestUrl.pathname}${requestUrl.search}`, site.origin).toString();
  return { location, status: ["GET", "HEAD"].includes(method) ? 301 : 308 };
};
