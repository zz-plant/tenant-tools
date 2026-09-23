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
