import { parseBuildingKeys } from "./index";

/*
 * Building keys that stewards issue from the site, so a union can run its own copy without
 * editing deploy settings. Only a SHA-256 hash of each key is stored.
 *
 * KV:  config:building-keys   { v: 1, buildings: { [buildingId]: { hash, issuedAt } } }
 *
 * A key issued here replaces any key for that building in BUILDING_KEYS_JSON. That is how a
 * steward rotates a key that reached management: issue a new one, and the old one stops working.
 *
 * The rest of the app checks keys with the plain functions in ./index. Middleware hashes the
 * key the request presents, compares it with this registry, and gives that request a
 * BUILDING_KEYS_JSON overlay (see buildAccessOverlay). The shared env object is never changed.
 */

export const KEY_REGISTRY_KV_KEY = "config:building-keys";

export type KeyRegistryEntry = { hash: string; issuedAt: string };
export type KeyRegistry = { v: 1; buildings: Record<string, KeyRegistryEntry> };

export const emptyKeyRegistry = (): KeyRegistry => ({ v: 1, buildings: {} });

// No 0/O or 1/I/L, so keys can be read aloud and typed on a phone.
const keyAlphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const keyGroups = 3;
const keyGroupLength = 5;

/** "K7QXM-2HRTP-9WCNA": 15 random characters, about 74 bits. */
export const generateBuildingKey = () => {
  const bytes = new Uint8Array(keyGroups * keyGroupLength);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (byte) => keyAlphabet[byte % keyAlphabet.length]);
  return Array.from({ length: keyGroups }, (_, group) =>
    chars.slice(group * keyGroupLength, (group + 1) * keyGroupLength).join("")
  ).join("-");
};

/** Keys are compared without case or outer spaces, so a key typed in lowercase still works. */
const normalizeForHash = (key: string) => key.trim().toUpperCase();

export const hashBuildingKey = async (key: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`building-key:v1:${normalizeForHash(key)}`)
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const parseKeyRegistry = (value: unknown): KeyRegistry => {
  if (!value || typeof value !== "object" || (value as { v?: unknown }).v !== 1) {
    return emptyKeyRegistry();
  }
  const raw = (value as { buildings?: unknown }).buildings;
  const buildings: Record<string, KeyRegistryEntry> = {};
  if (raw && typeof raw === "object") {
    Object.entries(raw as Record<string, unknown>).forEach(([buildingId, entry]) => {
      const candidate = entry as Partial<KeyRegistryEntry> | null;
      if (candidate && typeof candidate.hash === "string" && /^[a-f0-9]{64}$/.test(candidate.hash)) {
        buildings[buildingId] = { hash: candidate.hash, issuedAt: String(candidate.issuedAt ?? "") };
      }
    });
  }
  return { v: 1, buildings };
};

/** Short cache: a new key works, and an old one stops, within about a minute. */
const REGISTRY_CACHE_SECONDS = 60;

export const loadKeyRegistry = async (kv: KVNamespace, options: { fresh?: boolean } = {}) =>
  parseKeyRegistry(
    await kv.get(KEY_REGISTRY_KV_KEY, options.fresh ? { type: "json" } : { type: "json", cacheTtl: REGISTRY_CACHE_SECONDS })
  );

export const saveKeyRegistry = async (kv: KVNamespace, registry: KeyRegistry) =>
  kv.put(KEY_REGISTRY_KV_KEY, JSON.stringify(registry));

export type PresentedKey = { key: string; hash: string };

/**
 * BUILDING_KEYS_JSON for one request.
 * - Buildings only in deploy settings keep their settings key.
 * - Buildings in the registry use the presented key when its hash matches, and otherwise a
 *   random value that no one can present. A registry entry always wins over settings.
 */
export const buildAccessOverlay = ({
  settingsJson,
  registry,
  presented,
  sentinel,
}: {
  settingsJson: string | undefined;
  registry: KeyRegistry;
  presented: PresentedKey[];
  sentinel: string;
}) => {
  const overlay: Record<string, string> = { ...parseBuildingKeys(settingsJson) };
  Object.entries(registry.buildings).forEach(([buildingId, entry]) => {
    const match = presented.find((candidate) => candidate.hash === entry.hash);
    overlay[buildingId] = match ? match.key.trim() : sentinel;
  });
  return overlay;
};

/**
 * Access settings for a request when the registry cannot be read. No building key and no
 * shared fallback key, so no resident key works. Failing open could bring back a replaced key.
 */
export const closedAccessEnv = { BUILDING_KEYS_JSON: "{}", BUILDING_ACCESS_KEY: "" } as const;

/** Every building id the site knows: deploy settings plus steward-issued keys. */
export const listKnownBuildings = (settingsJson: string | undefined, registry: KeyRegistry) =>
  [...new Set([...Object.keys(parseBuildingKeys(settingsJson)), ...Object.keys(registry.buildings)])].sort((a, b) =>
    a.localeCompare(b)
  );
