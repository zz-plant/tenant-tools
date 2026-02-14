export const createWaitlistRecord = <T extends Record<string, unknown>>(data: T) => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  ...data,
});
