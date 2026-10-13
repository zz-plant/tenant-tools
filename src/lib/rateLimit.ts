type KvNamespace = {
  get: (key: string, options?: { type?: "json" }) => Promise<unknown>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
};

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfter: number };

const getSeconds = (ms: number) => Math.ceil(ms / 1000);

/*
 * Cloudflare's Rate Limiting binding (`ratelimits` in wrangler.jsonc). It keeps counts in memory
 * at each Cloudflare location, so it uses no KV writes. A binding has one fixed limit, so there is
 * one binding per limit: RATE_LIMIT_<limit>_PER_MINUTE. Routes without a matching binding (and
 * tests) use the KV counter below.
 */
type RateLimitBinding = { limit: (options: { key: string }) => Promise<{ success: boolean }> };

export const rateLimitBindingName = (limit: number, windowMs: number) =>
  windowMs === 60_000 ? `RATE_LIMIT_${limit}_PER_MINUTE` : null;

export const findRateLimitBinding = (env: Record<string, unknown>, limit: number, windowMs: number) => {
  const name = rateLimitBindingName(limit, windowMs);
  const candidate = name ? env[name] : undefined;
  return candidate && typeof (candidate as RateLimitBinding).limit === "function" ? (candidate as RateLimitBinding) : null;
};

export const enforceBindingRateLimit = async (
  binding: RateLimitBinding,
  key: string,
  windowMs: number
): Promise<RateLimitResult> => {
  try {
    const { success } = await binding.limit({ key });
    return success ? { ok: true } : { ok: false, retryAfter: getSeconds(windowMs) };
  } catch {
    // Rate limiting is a guard, not a gate. If the binding fails, let the request through.
    return { ok: true };
  }
};

export const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for");
  if (!forwarded) {
    return "unknown";
  }
  return forwarded.split(",")[0].trim();
};

export const enforceRateLimit = async ({
  kv,
  key,
  limit,
  windowMs,
}: {
  kv: KvNamespace;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> => {
  const now = Date.now();
  const record = (await kv.get(key, { type: "json" })) as { count?: number; resetAt?: number } | null;
  const resetAt = record?.resetAt ?? 0;
  const count = record?.count ?? 0;

  if (resetAt && resetAt > now && count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
    return { ok: false, retryAfter };
  }

  const nextResetAt = resetAt > now ? resetAt : now + windowMs;
  const nextCount = resetAt > now ? count + 1 : 1;
  try {
    await kv.put(key, JSON.stringify({ count: nextCount, resetAt: nextResetAt }), {
      expirationTtl: getSeconds(windowMs),
    });
  } catch {
    // KV allows one write per second to the same key. A refused write means another request
    // on this counter just ran, so treat it as a burst: answer 429 ("try again"), not a 500.
    // Letting it through would let a burst skip the limit, because the count never goes up.
    return { ok: false, retryAfter: 1 };
  }

  return { ok: true };
};
