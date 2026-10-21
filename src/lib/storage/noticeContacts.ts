import { listNoticeContactLines, parseNoticeContacts, type BuilderNoticeContacts, type NoticeContacts } from "../noticeContacts";
import { hashBuildingId } from "./submissions";

/*
 * KV:  contacts:{buildingHash}   The building's "who to send notices to" card (JSON).
 * `buildingHash` is the same one-way hash as the building index, so keys never show an address.
 */

export const noticeContactsKey = (buildingHash: string) => `contacts:${buildingHash}`;

export const getNoticeContacts = async (kv: KVNamespace, building: string): Promise<NoticeContacts | null> =>
  parseNoticeContacts(await kv.get(noticeContactsKey(await hashBuildingId(building)), { type: "json" }));

export const saveNoticeContacts = async (kv: KVNamespace, building: string, contacts: NoticeContacts) =>
  kv.put(noticeContactsKey(await hashBuildingId(building)), JSON.stringify(contacts));

export const deleteNoticeContacts = async (kv: KVNamespace, building: string) =>
  kv.delete(noticeContactsKey(await hashBuildingId(building)));

/** Most buildings one device loads cards for. A key for every building (`"*"`) is capped here. */
export const builderContactsLimit = 10;

/**
 * Cards for the notice builder's "Send it to" box. Contacts are resident-only, so only buildings
 * the device's key unlocks are read. `"*"` (a key for every building) reads the listed buildings.
 * A failed read leaves that building out instead of breaking the page.
 */
export const loadBuilderNoticeContacts = async (
  kv: KVNamespace,
  residentBuildings: string[],
  listedBuildings: string[]
): Promise<Record<string, BuilderNoticeContacts>> => {
  const buildings = (residentBuildings.includes("*") ? listedBuildings : residentBuildings).slice(0, builderContactsLimit);
  const cards: Record<string, BuilderNoticeContacts> = {};
  await Promise.all(
    buildings.map(async (building) => {
      const contacts = await getNoticeContacts(kv, building).catch(() => null);
      if (contacts) {
        cards[building] = { lines: listNoticeContactLines(contacts), updatedAt: contacts.updatedAt };
      }
    })
  );
  return cards;
};
