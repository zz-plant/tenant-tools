/*
 * "Quick exit" for residents on a shared or watched phone.
 * `?forget=1` clears the key cookies and stays on the site.
 * `?forget=1&exit=1` also clears the session cookie and leaves for a neutral site.
 */

export const QUICK_EXIT_DESTINATION = "https://www.google.com/";
export const QUICK_EXIT_PATH = "/?forget=1&exit=1";

/** Where to send the browser after the key cookies are cleared. */
export const resolveForgetRedirect = (url: URL) => {
  if (url.searchParams.get("exit") === "1") {
    return { location: QUICK_EXIT_DESTINATION, clearSession: true };
  }
  const next = new URL(url.toString());
  ["forget", "exit", "key", "stewardKey"].forEach((param) => next.searchParams.delete(param));
  return { location: `${next.pathname}${next.search}`, clearSession: false };
};
