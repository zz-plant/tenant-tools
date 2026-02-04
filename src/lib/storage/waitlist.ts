export type WaitlistStorageEnv = {
  WAITLIST_KV?: KVNamespace;
};

const waitlistKey = (id: string) => `waitlist:${id}`;

export const getWaitlistKv = (env: WaitlistStorageEnv) => env.WAITLIST_KV ?? null;

export const saveWaitlistEntry = async (kv: KVNamespace, record: { id: string }) =>
  kv.put(waitlistKey(record.id), JSON.stringify(record));
