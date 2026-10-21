import { parseNoticeContacts, type NoticeContacts } from "../noticeContacts";
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
