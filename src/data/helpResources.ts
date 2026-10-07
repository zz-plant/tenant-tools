import helpResourcesData from "./rules/chicago/help_resources.json";

/** Where residents can get help, plus City lookups. Referral information only. */

export type HelpResource = {
  name: string;
  description: string;
  phone?: string;
  url: string;
};

export type HelpResourceGroup = {
  id: string;
  title: string;
  note?: string;
  items: HelpResource[];
};

const data = helpResourcesData as { last_reviewed: string; groups: HelpResourceGroup[] };

export const helpResourceGroups = data.groups;
export const helpResourcesLastReviewed = data.last_reviewed;

/** "773-292-4988" -> "tel:7732924988" */
export const toTelHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
