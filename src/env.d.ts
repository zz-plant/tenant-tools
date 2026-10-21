/// <reference path="../.astro/types.d.ts" />

type KVNamespace = {
  get: <T = unknown>(key: string, options?: { type?: "json"; cacheTtl?: number }) => Promise<T | null>;
  put: (key: string, value: string, options?: { expirationTtl?: number; metadata?: unknown }) => Promise<void>;
  delete: (key: string) => Promise<void>;
  list: (options: { prefix: string; cursor?: string; limit?: number }) => Promise<{
    keys: Array<{ name: string; metadata?: unknown }>;
    list_complete: boolean;
    cursor?: string;
  }>;
};

/** Minimal R2 surface used for private evidence files. */
type R2ObjectBody = {
  body: ReadableStream;
  size: number;
  httpMetadata?: { contentType?: string };
  arrayBuffer: () => Promise<ArrayBuffer>;
};

type R2Bucket = {
  put: (
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType?: string } }
  ) => Promise<unknown>;
  get: (key: string) => Promise<R2ObjectBody | null>;
  delete: (key: string) => Promise<void>;
};

/** Cloudflare bindings and settings this app reads. */
type BuildingLedgerEnv = {
  SUBMISSIONS_KV?: KVNamespace;
  BUILDING_ACCESS_KEY?: string;
  BUILDING_KEYS_JSON?: string;
  STEWARD_KEY?: string;
  EVIDENCE_BUCKET?: R2Bucket;
  EVIDENCE_SIGNING_KEY?: string;
};

/** Only the middleware imports this. It copies the env onto `locals.env` for each request. */
declare module "cloudflare:workers" {
  export const env: BuildingLedgerEnv;
}

declare namespace App {
  interface Locals {
    /**
     * Set by middleware for each request: the Worker env, with steward-issued building keys applied
     * to BUILDING_KEYS_JSON. Pages and API routes read bindings from here, not from `cloudflare:workers`.
     */
    env?: BuildingLedgerEnv;
  }
}

declare module "*.json" {
  const value: unknown;
  export default value;
}
