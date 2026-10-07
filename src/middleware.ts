import { defineMiddleware } from "astro:middleware";
import { RESIDENT_KEY_COOKIE, SESSION_ID_COOKIE, STEWARD_KEY_COOKIE } from "./lib/api/requestGuard";
import { resolveForgetRedirect } from "./lib/quickExit";
import { buildAccessOverlay, hashBuildingKey, loadKeyRegistry } from "./lib/access/registry";

// Residents return from group chat links many times. A short TTL forces key re-entry too often.
// "Forget key on this device" (`?forget=1`) clears it on shared phones.
export const ACCESS_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 14;
const STEWARD_COOKIE_TTL_SECONDS = 60 * 15;
const SESSION_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 30;

const randomSessionId = () => crypto.randomUUID().replace(/-/g, "");

type MiddlewareContext = Parameters<Parameters<typeof defineMiddleware>[0]>[0];

/**
 * Applies steward-issued building keys for this request only (see lib/access/registry.ts).
 * Pages and API routes keep reading BUILDING_KEYS_JSON from `locals.runtime.env`.
 */
const applyKeyRegistry = async (context: MiddlewareContext, url: URL) => {
  const runtime = context.locals.runtime;
  const env = runtime?.env;
  const kv = env?.SUBMISSIONS_KV;
  if (!runtime || !env || !kv || context.isPrerendered) {
    return;
  }
  try {
    const registry = await loadKeyRegistry(kv);
    if (Object.keys(registry.buildings).length === 0) {
      return;
    }
    const candidates = [
      context.cookies.get(RESIDENT_KEY_COOKIE)?.value,
      url.searchParams.get("key"),
      context.request.headers.get("x-building-key"),
    ]
      .map((value) => value?.trim() ?? "")
      .filter((value, index, all) => value && all.indexOf(value) === index);
    const presented = await Promise.all(candidates.map(async (key) => ({ key, hash: await hashBuildingKey(key) })));
    const overlay = buildAccessOverlay({
      settingsJson: env.BUILDING_KEYS_JSON,
      registry,
      presented,
      sentinel: `unset-${crypto.randomUUID()}`,
    });
    // `runtime` is created for each request. The shared env object is copied, never changed.
    context.locals.runtime = { ...runtime, env: { ...env, BUILDING_KEYS_JSON: JSON.stringify(overlay) } };
  } catch {
    // If the registry cannot be read, keys from deploy settings still work.
  }
};

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const residentKey = url.searchParams.get("key")?.trim() ?? "";
  const stewardKey = url.searchParams.get("stewardKey")?.trim() ?? "";

  const useSecureCookie = context.url.protocol === "https:";

  await applyKeyRegistry(context, url);

  if (url.searchParams.get("forget") === "1" && ["GET", "HEAD"].includes(context.request.method)) {
    context.cookies.delete(RESIDENT_KEY_COOKIE, { path: "/" });
    context.cookies.delete(STEWARD_KEY_COOKIE, { path: "/" });
    const { location, clearSession } = resolveForgetRedirect(url);
    if (clearSession) {
      context.cookies.delete(SESSION_ID_COOKIE, { path: "/" });
    }
    return context.redirect(location);
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
