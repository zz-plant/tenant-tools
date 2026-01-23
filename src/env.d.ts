/// <reference path="../.astro/types.d.ts" />

type KVNamespace = {
  get: (key: string, options?: { type: "json" }) => Promise<unknown | null>;
  put: (key: string, value: string) => Promise<void>;
};

declare namespace App {
  interface Locals {
    runtime?: {
      env?: {
        SUBMISSIONS_KV?: KVNamespace;
      };
    };
  }
}
