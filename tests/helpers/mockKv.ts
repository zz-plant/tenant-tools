type Entry = { value: string; metadata?: unknown };

/** In-memory stand-in for a Cloudflare KV namespace, with list metadata and prefix listing. */
export const createMockKv = () => {
  const store = new Map<string, Entry>();
  const reads: string[] = [];

  const kv = {
    async get(key: string, options?: { type?: "json" }) {
      reads.push(key);
      const entry = store.get(key);
      if (!entry) {
        return null;
      }
      return options?.type === "json" ? JSON.parse(entry.value) : entry.value;
    },
    async put(key: string, value: string, options: { expirationTtl?: number; metadata?: unknown } = {}) {
      store.set(key, { value, metadata: options.metadata });
    },
    async delete(key: string) {
      store.delete(key);
    },
    async list({ prefix, cursor, limit = 1000 }: { prefix: string; cursor?: string; limit?: number }) {
      const names = [...store.keys()].filter((name) => name.startsWith(prefix)).sort();
      const start = cursor ? Number(cursor) : 0;
      const slice = names.slice(start, start + limit);
      const next = start + slice.length;
      return {
        keys: slice.map((name) => ({ name, metadata: store.get(name)?.metadata })),
        list_complete: next >= names.length,
        cursor: next >= names.length ? undefined : String(next),
      };
    },
    keys: () => [...store.keys()],
    /** Reads of full records (`submission:*`). */
    recordReadCount: () => reads.filter((key) => key.startsWith("submission:")).length,
    resetReads: () => {
      reads.length = 0;
    },
    getCallCount: () => reads.length,
  };
  return kv;
};

export type MockKv = ReturnType<typeof createMockKv>;

export const asKv = (kv: MockKv) => kv as unknown as KVNamespace;

/** In-memory stand-in for an R2 bucket. */
export const createMockBucket = () => {
  const objects = new Map<string, { bytes: Uint8Array; contentType?: string }>();
  const bucket = {
    async put(key: string, value: ArrayBuffer | Uint8Array, options?: { httpMetadata?: { contentType?: string } }) {
      const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
      objects.set(key, { bytes: new Uint8Array(bytes), contentType: options?.httpMetadata?.contentType });
    },
    async get(key: string) {
      const object = objects.get(key);
      if (!object) return null;
      return {
        body: new Response(object.bytes as unknown as BodyInit).body as ReadableStream,
        size: object.bytes.length,
        httpMetadata: { contentType: object.contentType },
        arrayBuffer: async () => object.bytes.buffer.slice(0) as ArrayBuffer,
      };
    },
    async delete(key: string) {
      objects.delete(key);
    },
    keys: () => [...objects.keys()],
    bytesOf: (key: string) => objects.get(key)?.bytes ?? null,
  };
  return bucket;
};
