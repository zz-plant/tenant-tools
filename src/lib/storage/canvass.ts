import { parseCanvass, type Canvass } from "../canvass";
import { hashBuildingId } from "./submissions";

/*
 * KV:  canvass:{buildingHash}:{canvassId}   One canvass tally (JSON). List metadata holds it too.
 * `buildingHash` is the same one-way hash as the building index, so keys never show an address.
 */

const canvassPrefix = (buildingHash: string) => `canvass:${buildingHash}:`;

export const isCanvassId = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{16}$/.test(value);

export const newCanvassId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 16);

/** Canvasses for a building, newest first. */
export const listCanvasses = async (kv: KVNamespace, building: string): Promise<Canvass[]> => {
  const prefix = canvassPrefix(await hashBuildingId(building));
  const canvasses: Canvass[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix, cursor, limit: 1000 });
    for (const key of page.keys) {
      const id = key.name.slice(prefix.length);
      const parsed = parseCanvass(id, key.metadata ?? (await kv.get(key.name, { type: "json" })));
      if (parsed) {
        canvasses.push(parsed);
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return canvasses.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
};

export const saveCanvass = async (kv: KVNamespace, building: string, canvass: Canvass) => {
  const { id, ...data } = canvass;
  await kv.put(`${canvassPrefix(await hashBuildingId(building))}${id}`, JSON.stringify(data), { metadata: data });
};

export const deleteCanvass = async (kv: KVNamespace, building: string, canvassId: string) =>
  kv.delete(`${canvassPrefix(await hashBuildingId(building))}${canvassId}`);
