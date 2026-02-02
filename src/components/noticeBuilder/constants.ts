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
    description: "Pick building, issue, and stage.",
    requirement: "Required",
  },
  {
    id: 2,
    title: "Add facts",
    label: "Issue details",
    description: "Add short facts if you want.",
    requirement: "Optional",
  },
  {
    id: 3,
    title: "Set dates",
    label: "Dates & language",
    description: "Confirm dates and language.",
    requirement: "Required",
  },
  {
    id: 4,
    title: "Review & share",
    label: "Notice & save",
    description: "Copy notice and save.",
    requirement: "Review",
  },
];

export const exportAudienceOptions: Array<{ id: ExportAudience; label: string; description: string }> = [
  {
    id: "inspector",
    label: "Inspector",
    description: "Focus on dates and conditions for an inspection review.",
  },
  {
    id: "legal",
    label: "Legal aid",
    description: "Adds stage history and report counts for case intake.",
  },
  {
    id: "management",
    label: "Management",
    description: "Shares a concise summary without report counts or evidence notes.",
  },
  {
    id: "personal",
    label: "Personal records",
    description: "Keeps a full timeline summary for your own files.",
  },
];

export const exportStatusOptions: Array<{ id: SubmissionStatus; label: string; description: string }> = [
  {
    id: "open",
    label: "Open",
    description: "Issue is still happening.",
  },
  {
    id: "resolved",
    label: "Resolved",
    description: "Repairs are complete.",
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
    description: "Use this for most new issues.",
  },
  {
    id: "B",
    label: `B. ${stages.B}`,
    description: "Use this after the first notice.",
  },
  {
    id: "C",
    label: `C. ${stages.C}`,
    description: "Use this after a follow-up.",
  },
];

export const evidenceSafetyChecklist = [
  "Evidence is private by default.",
  "Do not upload faces.",
  "Do not upload names, mail labels, or unit numbers.",
  "Do not upload leases or ID documents.",
  "Remove location data if you can.",
];

export const freeTextSafetyNote = "Write short facts only. Do not include names or unit numbers.";

export const detailWarningThreshold = detailCharacterLimit - 40;

export const factualTagOptions: Partial<Record<keyof typeof fieldDefinitions, string[]>> = {
  location: ["kitchen", "bathroom", "ceiling", "hallway"],
  attachment: ["photo", "video", "screenshot"],
  pestType: ["roaches", "rats", "bedbugs"],
  commonArea: ["elevator", "garage door", "hall lights", "trash room"],
  lockoutAction: ["locked out", "utilities shut off"],
  issueDescription: ["broken elevator", "water leak", "no heat", "mold smell"],
};
