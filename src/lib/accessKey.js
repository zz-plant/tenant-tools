const ACCESS_KEY_QUERY_PARAM = "access_key";
const ACCESS_KEY_HEADER = "x-building-access-key";

const normalizeKey = (value) => (typeof value === "string" ? value.trim() : "");

const extractAccessKey = (request) => {
  const url = new URL(request.url);
  const fromQuery = normalizeKey(url.searchParams.get(ACCESS_KEY_QUERY_PARAM));
  if (fromQuery) {
    return fromQuery;
  }
  return normalizeKey(request.headers.get(ACCESS_KEY_HEADER));
};

export const validateAccessKey = (request, env) => {
  const expectedKey = normalizeKey(env?.BUILDING_ACCESS_KEY);
  if (!expectedKey) {
    return { ok: false, reason: "missing-config" };
  }

  const providedKey = extractAccessKey(request);
  if (!providedKey) {
    return { ok: false, reason: "missing-key" };
  }

  if (providedKey !== expectedKey) {
    return { ok: false, reason: "invalid-key" };
  }

  return { ok: true };
};

export const enforceAccessKey = (request, env) => {
  const validation = validateAccessKey(request, env);
  if (validation.ok) {
    return { ok: true };
  }
  return {
    ok: false,
    response: new Response("Access key required.", { status: 403 }),
    reason: validation.reason,
  };
};
