import { defineMiddleware } from "astro:middleware";
import { RESIDENT_KEY_COOKIE, SESSION_ID_COOKIE, STEWARD_KEY_COOKIE } from "./lib/api/requestGuard";

// Residents return from group chat links many times. A short TTL forces key re-entry too often.
// "Forget key on this device" (`?forget=1`) clears it on shared phones.
export const ACCESS_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 14;
const STEWARD_COOKIE_TTL_SECONDS = 60 * 15;
const SESSION_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 30;

const randomSessionId = () => crypto.randomUUID().replace(/-/g, "");

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const residentKey = url.searchParams.get("key")?.trim() ?? "";
  const stewardKey = url.searchParams.get("stewardKey")?.trim() ?? "";

  const useSecureCookie = context.url.protocol === "https:";

  if (url.searchParams.get("forget") === "1" && ["GET", "HEAD"].includes(context.request.method)) {
    context.cookies.delete(RESIDENT_KEY_COOKIE, { path: "/" });
    context.cookies.delete(STEWARD_KEY_COOKIE, { path: "/" });
    url.searchParams.delete("forget");
    url.searchParams.delete("key");
    url.searchParams.delete("stewardKey");
    return context.redirect(`${url.pathname}${url.search}`);
  }

  if (!context.cookies.get(SESSION_ID_COOKIE)?.value) {
    context.cookies.set(SESSION_ID_COOKIE, randomSessionId(), {
      httpOnly: true,
      sameSite: "lax",
      secure: useSecureCookie,
      path: "/",
      maxAge: SESSION_COOKIE_TTL_SECONDS,
    });
  }

  if (residentKey) {
    context.cookies.set(RESIDENT_KEY_COOKIE, residentKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: useSecureCookie,
      path: "/",
      maxAge: ACCESS_COOKIE_TTL_SECONDS,
    });
  }

  if (stewardKey) {
    context.cookies.set(STEWARD_KEY_COOKIE, stewardKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: useSecureCookie,
      path: "/",
      maxAge: STEWARD_COOKIE_TTL_SECONDS,
    });
  }

  if ((residentKey || stewardKey) && ["GET", "HEAD"].includes(context.request.method)) {
    url.searchParams.delete("key");
    url.searchParams.delete("stewardKey");
    return context.redirect(`${url.pathname}${url.search}`);
  }

  return next();
});
