type KvNamespace = {
  get: (key: string, options?: { type?: "json" }) => Promise<unknown>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
};

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfter: number };

const getSeconds = (ms: number) => Math.ceil(ms / 1000);

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
  await kv.put(key, JSON.stringify({ count: nextCount, resetAt: nextResetAt }), {
    expirationTtl: getSeconds(windowMs),
  });

  return { ok: true };
};
