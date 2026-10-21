import { isValidDateString } from "./validation";

/*
 * Compares a landlord's notice of entry with RLTO 5-12-050: at least two days' notice, except in
 * an emergency. Information only. Nothing here is saved.
 */

export const entryNoticeHours = 48;

/** Hours the RLTO treats as reasonable for entry. */
export const reasonableEntryStart = "08:00";
export const reasonableEntryEnd = "20:00";

export type EntryNoticeCheck = {
  /** "unclear" means the dates are exactly two days apart and a time is missing. */
  result: "on_time" | "late" | "unclear";
  daysGiven: number;
  /** Present when both times are known. */
  hoursGiven?: number;
  /** Latest date and time the notice could arrive and still be on time. Present when the entry time is known. */
  latestOnTime?: { date: string; time: string };
  /** The planned entry time is before 8 AM or after 8 PM. */
  outsideReasonableHours: boolean;
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const hourMs = 60 * 60 * 1000;
const toUtc = (date: string, time = "00:00") => Date.parse(`${date}T${time}:00Z`);

export const checkEntryNotice = ({
  noticeDate,
  noticeTime = "",
  entryDate,
  entryTime = "",
}: {
  noticeDate: string;
  noticeTime?: string;
  entryDate: string;
  entryTime?: string;
}): EntryNoticeCheck | null => {
  if (!isValidDateString(noticeDate) || !isValidDateString(entryDate) || entryDate < noticeDate) {
    return null;
  }
  const hasNoticeTime = timePattern.test(noticeTime);
  const hasEntryTime = timePattern.test(entryTime);
  const daysGiven = Math.round((toUtc(entryDate) - toUtc(noticeDate)) / (24 * hourMs));
  const outsideReasonableHours = hasEntryTime && (entryTime < reasonableEntryStart || entryTime > reasonableEntryEnd);

  let latestOnTime: EntryNoticeCheck["latestOnTime"];
  if (hasEntryTime) {
    const latest = new Date(toUtc(entryDate, entryTime) - entryNoticeHours * hourMs).toISOString();
    latestOnTime = { date: latest.slice(0, 10), time: latest.slice(11, 16) };
  }

  if (hasNoticeTime && hasEntryTime) {
    const hoursGiven = Math.floor((toUtc(entryDate, entryTime) - toUtc(noticeDate, noticeTime)) / hourMs);
    if (hoursGiven < 0) {
      return null;
    }
    return {
      result: hoursGiven >= entryNoticeHours ? "on_time" : "late",
      daysGiven,
      hoursGiven,
      latestOnTime,
      outsideReasonableHours,
    };
  }

  const result = daysGiven > 2 ? "on_time" : daysGiven < 2 ? "late" : "unclear";
  return { result, daysGiven, ...(latestOnTime ? { latestOnTime } : {}), outsideReasonableHours };
};
