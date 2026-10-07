import type { NoticeTier } from "../data/rules";
import { isValidDateString } from "./validation";

export type FairNoticeCheck = {
  requiredDays: number;
  /** Days between the date the notice arrived and the date the change starts. */
  daysGiven: number;
  onTime: boolean;
  /** Last day the notice could arrive and still be on time. */
  latestOnTimeDate: string;
};

const dayMs = 24 * 60 * 60 * 1000;
const toUtc = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`);

/**
 * Compares a rent increase or non-renewal notice with the Fair Notice period for the tenant's
 * length of stay. Information only. Nothing here is saved.
 */
export const checkFairNotice = ({
  tiers,
  tierId,
  noticeDate,
  changeDate,
}: {
  tiers: NoticeTier[];
  tierId: string;
  noticeDate: string;
  changeDate: string;
}): FairNoticeCheck | null => {
  const tier = tiers.find((entry) => entry.id === tierId);
  if (!tier || !isValidDateString(noticeDate) || !isValidDateString(changeDate)) {
    return null;
  }
  const daysGiven = Math.round((toUtc(changeDate) - toUtc(noticeDate)) / dayMs);
  const latestOnTimeDate = new Date(toUtc(changeDate) - tier.days * dayMs).toISOString().slice(0, 10);
  return { requiredDays: tier.days, daysGiven, onTime: daysGiven >= tier.days, latestOnTimeDate };
};
