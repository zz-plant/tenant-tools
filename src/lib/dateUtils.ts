export const formatDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export const formatCalendarDate = (date: Date) => date.toISOString().slice(0, 10).replaceAll("-", "");

export const getCurrentTime = (date: Date) =>
  `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/**
 * "2026-09-03" -> "Sep 3, 2026". Date-only strings are read as UTC by `new Date`, so format them
 * in UTC too. Otherwise residents west of UTC see the day before.
 */
export const formatTimelineDate = (value: string) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(isDateOnly ? { timeZone: "UTC" } : {}),
  });
};
