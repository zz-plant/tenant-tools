/// <reference path="../.astro/types.d.ts" />

type KVNamespace = {
  get: (key: string, options?: { type: "json" }) => Promise<unknown | null>;
  put: (key: string, value: string) => Promise<void>;
  list: (options: { prefix: string; cursor?: string; limit?: number }) => Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor?: string;
  }>;
};

declare namespace App {
  interface Locals {
    runtime?: {
      env?: {
        SUBMISSIONS_KV?: KVNamespace;
        BUILDING_ACCESS_KEY?: string;
        STEWARD_KEY?: string;
      };
    };
  }
}

declare module "*.json" {
  const value: unknown;
  export default value;
}
