import {
  fieldDefinitions,
  stages,
} from "../../data/noticeData";
import { detailCharacterLimit, type SubmissionStatus } from "../../lib/submissions";
import type { ExportAudience } from "../../lib/exportSummary";
import type { Stage } from "./types";

export const steps = [
  {
    id: 1,
    title: "Basics",
    label: "Building & issue",
    description: "Pick your building, issue type, and notice step.",
    requirement: "Required",
  },
  {
    id: 2,
    title: "Dates",
    label: "Dates & language",
    description: "Set dates and reading level.",
    requirement: "Required",
  },
  {
    id: 3,
    title: "Details",
    label: "Facts & evidence",
    description: "Add short facts if needed.",
    requirement: "Optional",
  },
  {
    id: 4,
    title: "Save",
    label: "Preview & export",
    description: "Copy or save the record.",
    requirement: "Review",
  },
];

export const exportAudienceOptions: Array<{ id: ExportAudience; label: string; description: string }> = [
  {
    id: "inspector",
    label: "Inspector",
    description: "Includes timeline and factual details.",
  },
  {
    id: "legal",
    label: "Legal aid",
    description: "Includes stage history and report counts.",
  },
  {
    id: "management",
    label: "Management",
    description: "Excludes evidence details for safer sharing.",
  },
  {
    id: "personal",
    label: "Personal records",
    description: "Includes full timeline for your records.",
  },
];

export const exportStatusOptions: Array<{ id: SubmissionStatus; label: string; description: string }> = [
  {
    id: "open",
    label: "Open",
    description: "Issue still happening.",
  },
  {
    id: "resolved",
    label: "Resolved",
    description: "Repairs complete.",
  },
  {
    id: "archived",
    label: "Archived",
    description: "Record closed for now.",
  },
];

export const stageOptions: Array<{ id: Stage; label: string; description: string }> = [
  {
    id: "A",
    label: `A. ${stages.A}`,
    description: "Example: first message about a new issue.",
  },
  {
    id: "B",
    label: `B. ${stages.B}`,
    description: "Example: no repair yet after first message.",
  },
  {
    id: "C",
    label: `C. ${stages.C}`,
    description: "Example: final calm reminder after follow-up.",
  },
];

export const evidenceSafetyChecklist = [
  "Evidence stays private.",
  "Do not upload faces.",
  "Do not upload names, mail labels, or unit numbers.",
  "Do not upload leases or ID documents.",
  "If a photo is blurry or dark, retake it before upload.",
  "Remove location data if you can.",
];


export const evidenceSafetySummary =
  "Do not upload photos with faces, names, mail labels, unit numbers, leases, or ID documents. Retake blurry or dark photos.";

export const freeTextSafetyNote = "Short facts only. No names or unit numbers.";

export const detailWarningThreshold = detailCharacterLimit - 40;

export const factualTagOptions: Partial<Record<keyof typeof fieldDefinitions, string[]>> = {
  location: [
    "kitchen ceiling",
    "bathroom ceiling",
    "radiator pipe",
    "living room window",
    "under kitchen sink",
    "hallway outside unit",
  ],
  attachment: ["photo taken today", "video of leak", "screenshot of portal request"],
  pestType: ["roaches", "mice / rats", "bedbugs", "fruit flies"],
  commonArea: [
    "elevator out of service",
    "garage door stuck",
    "hallway lights out",
    "package room fobs",
    "trash chute blocked",
    "front entry callbox",
  ],
  lockoutAction: ["locked out", "water shut off", "heat shut off", "power shut off"],
  cannotUse: ["garage parking", "alley entrance", "trash area", "bike room"],
  reason: ["garage entrance blocked", "City work in the alley", "garage door broken"],
  trashChange: ["trash room locked", "bins moved outside", "trash chute closed", "recycling removed"],
  accessItem: ["front door fob", "garage fob", "unit lock", "garage door", "callbox"],
  damagedItem: ["car in garage spot", "bike", "items in storage", "unit floor"],
  issueDescription: [
    "no heat / radiators cold",
    "water leak from above",
    "elevator not working",
    "front entry door unlatched",
    "door fobs not scanning",
    "hot water not working",
  ],
};

/**
 * Problems where a resident may think about paying less rent for a service they lost. The builder
 * shows a short warning for these: paying less can lead to an eviction case (AGENTS.md §6.3).
 */
export const rentCreditIssues: ReadonlySet<string> = new Set(["parking", "city-work", "trash", "common"]);
