import { parseRecordEvent, sortRecordEvents, type RecordEvent } from "../recordEvents";

/*
 * KV layout
 *
 * revt:{submissionId}:{eventId}   One dated fact on a record. List metadata holds the fact.
 *
 * Each fact has its own key. Two residents adding facts at the same moment, or a fact and a
 * "me too" tap, never overwrite each other, because the record JSON is not rewritten.
 */

const eventPrefix = (submissionId: string) => `revt:${submissionId}:`;
const eventKey = (submissionId: string, eventId: string) => `${eventPrefix(submissionId)}${eventId}`;

export const isRecordEventId = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{16}$/.test(value);

export const listRecordEvents = async (kv: KVNamespace, submissionId: string): Promise<RecordEvent[]> => {
  const events: RecordEvent[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix: eventPrefix(submissionId), cursor, limit: 1000 });
    for (const key of page.keys) {
      const id = key.name.slice(key.name.lastIndexOf(":") + 1);
      const stored = key.metadata ?? (await kv.get(key.name, { type: "json" }));
      const event = parseRecordEvent(id, stored);
      if (event) {
        events.push(event);
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return sortRecordEvents(events);
};

export const saveRecordEvent = async (kv: KVNamespace, submissionId: string, event: RecordEvent) => {
  const { id, ...fact } = event;
  await kv.put(eventKey(submissionId, id), JSON.stringify(fact), { metadata: fact });
};

export const deleteRecordEvent = async (kv: KVNamespace, submissionId: string, eventId: string) =>
  kv.delete(eventKey(submissionId, eventId));
