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
    title: "Choose basics",
    label: "Building & issue",
    description: "Pick building, issue, stage.",
    requirement: "Required",
  },
  {
    id: 2,
    title: "Confirm dates",
    label: "Dates & language",
    description: "Set dates and reading level.",
    requirement: "Required",
  },
  {
    id: 3,
    title: "Add facts",
    label: "Facts & evidence",
    description: "Add short facts if needed.",
    requirement: "Optional",
  },
  {
    id: 4,
    title: "Review & save",
    label: "Preview & export",
    description: "Copy or save the record.",
    requirement: "Review",
  },
];

export const exportAudienceOptions: Array<{ id: ExportAudience; label: string; description: string }> = [
  {
    id: "inspector",
    label: "Inspector",
    description: "Dates and conditions for inspection.",
  },
  {
    id: "legal",
    label: "Legal aid",
    description: "Stage history and report counts.",
  },
  {
    id: "management",
    label: "Management",
    description: "Concise summary without counts.",
  },
  {
    id: "personal",
    label: "Personal records",
    description: "Full timeline for your files.",
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
    description: "Use for most new issues.",
  },
  {
    id: "B",
    label: `B. ${stages.B}`,
    description: "Use after the first notice.",
  },
  {
    id: "C",
    label: `C. ${stages.C}`,
    description: "Use after a follow-up.",
  },
];

export const evidenceSafetyChecklist = [
  "Evidence stays private.",
  "Do not upload faces.",
  "Do not upload names, mail labels, or unit numbers.",
  "Do not upload leases or IDs.",
  "Remove location data if you can.",
];

export const freeTextSafetyNote = "Short facts only. No names or unit numbers.";

export const detailWarningThreshold = detailCharacterLimit - 40;

export const factualTagOptions: Partial<Record<keyof typeof fieldDefinitions, string[]>> = {
  location: ["kitchen", "bathroom", "ceiling", "hallway"],
  attachment: ["photo", "video", "screenshot"],
  pestType: ["roaches", "rats", "bedbugs"],
  commonArea: ["elevator", "garage door", "hall lights", "trash room"],
  lockoutAction: ["locked out", "utilities shut off"],
  issueDescription: ["broken elevator", "water leak", "no heat", "mold smell"],
};
