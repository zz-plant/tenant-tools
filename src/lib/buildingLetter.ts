import { formatTimelineDate } from "./dateUtils";

/*
 * Joint repair-plan letter from the residents of one building.
 * It lists open problems from the ledger and asks for a written plan by a date.
 * It has a household count instead of names. Counts under 3 are left out.
 * Firm and factual. No threats, no accusations (AGENTS.md §5).
 */

export type LetterIssue = {
  id: string;
  label: string;
  startDate: string;
  reportCount: number;
  /** Latest canvass count of households with this problem. */
  canvass?: { date: string; count: number };
};

export const letterCopyRecipients = {
  alderperson: "Office of the Alderperson",
  cha: "Chicago Housing Authority (CHA)",
  hud: "U.S. Department of Housing and Urban Development (HUD)",
} as const;

export type LetterCopyRecipient = keyof typeof letterCopyRecipients;

/** "management": joint repair-plan request. "alderperson": meeting request to the ward office. */
export type LetterKind = "management" | "alderperson";

export type BuildingLetterInput = {
  kind?: LetterKind;
  building: string;
  /** `YYYY-MM-DD` */
  today: string;
  issues: LetterIssue[];
  households: number;
  /** `YYYY-MM-DD` */
  replyBy: string;
  copyTo: LetterCopyRecipient[];
  /** Chicago ward number, 1 to 50. */
  ward?: number;
  simple: boolean;
  /** Alderperson letter: date the residents asked management for a repair plan (`YYYY-MM-DD`). */
  managementLetterDate?: string;
  /** Alderperson letter: no plan has come from management yet. */
  noPlanReceived?: boolean;
  /** Alderperson letter: the printable building summary is attached. */
  attachSummary?: boolean;
};

/** Smallest household or report count shown in the letter. Smaller counts can single people out. */
export const minCountShown = 3;

export const defaultReplyDays = 14;

const formatDay = (isoDate: string) => (isoDate ? formatTimelineDate(isoDate) : "");

const isValidWard = (ward: number | undefined): ward is number =>
  typeof ward === "number" && Number.isInteger(ward) && ward >= 1 && ward <= 50;

const copyLines = (copyTo: LetterCopyRecipient[], ward: number | undefined) =>
  (Object.keys(letterCopyRecipients) as LetterCopyRecipient[])
    .filter((recipient) => copyTo.includes(recipient))
    .map((recipient) =>
      recipient === "alderperson" && isValidWard(ward)
        ? `- ${letterCopyRecipients.alderperson}, Ward ${ward}`
        : `- ${letterCopyRecipients[recipient]}`
    );

const issueLine = (issue: LetterIssue, simple: boolean) => {
  const parts = [`- ${issue.label}.`];
  if (issue.startDate) {
    parts.push(`Started ${formatDay(issue.startDate)}.`);
  }
  if (!simple && issue.reportCount >= minCountShown) {
    parts.push(`${Math.floor(issue.reportCount)} residents report it.`);
  }
  if (issue.canvass && issue.canvass.count >= minCountShown) {
    const count = Math.floor(issue.canvass.count);
    parts.push(
      simple
        ? `A count on ${formatDay(issue.canvass.date)} found ${count} households with this problem.`
        : `A canvass on ${formatDay(issue.canvass.date)} counted ${count} households with this problem.`
    );
  }
  return parts.join(" ");
};

/** Meeting request to the alderperson's office. Same safety rules as the management letter. */
const buildAlderpersonLetter = ({
  building,
  today,
  issues,
  households,
  ward,
  simple,
  managementLetterDate,
  noPlanReceived,
  attachSummary,
}: BuildingLetterInput) => {
  const address = building.trim() || "[ADDRESS]";
  const office = isValidWard(ward) ? `${letterCopyRecipients.alderperson}, Ward ${ward}` : letterCopyRecipients.alderperson;
  const showHouseholds = Number.isFinite(households) && households >= minCountShown;
  const problemLines = issues.length > 0 ? issues.map((issue) => issueLine(issue, simple)) : ["- [PROBLEM]"];
  const askedOn = managementLetterDate ? formatDay(managementLetterDate) : "";

  const lines = simple
    ? [
        `Date: ${formatDay(today)}`,
        `To: ${office}`,
        "",
        `We live at ${address}.`,
        showHouseholds ? `${Math.floor(households)} households signed this letter.` : null,
        "These problems are not fixed:",
        ...problemLines,
        "",
        askedOn ? `We asked management for a repair plan on ${askedOn}.` : null,
        noPlanReceived ? "We did not get a plan." : null,
        "We want to meet with your office about these problems.",
        attachSummary ? "A summary with dates is attached." : null,
        "Please tell us a date and time to meet.",
        "",
        `Residents of ${address}`,
      ]
    : [
        `Date: ${formatDay(today)}`,
        `To: ${office}`,
        `From: Residents of ${address}`,
        "",
        `We are residents of ${address}${isValidWard(ward) ? ", in your ward" : ""}.`,
        showHouseholds ? `Residents of ${Math.floor(households)} households signed this letter.` : null,
        "",
        "These problems in our building are not fixed:",
        ...problemLines,
        "",
        askedOn ? `We asked building management for a written repair plan on ${askedOn}.` : null,
        noPlanReceived ? "We have not received a plan." : null,
        "We request a meeting with your office about these problems.",
        attachSummary ? "A printed summary of the problems and dates is attached." : null,
        "Please reply with a date and time for the meeting.",
        "",
        `Residents of ${address}`,
      ];

  return lines.filter((line): line is string => line !== null).join("\n");
};

export const buildBuildingLetter = (input: BuildingLetterInput) =>
  input.kind === "alderperson" ? buildAlderpersonLetter(input) : buildManagementLetter(input);

const buildManagementLetter = ({
  building,
  today,
  issues,
  households,
  replyBy,
  copyTo,
  ward,
  simple,
}: BuildingLetterInput) => {
  const address = building.trim() || "[ADDRESS]";
  const replyDate = formatDay(replyBy) || "[REPLY DATE]";
  const showHouseholds = Number.isFinite(households) && households >= minCountShown;
  const problemLines = issues.length > 0 ? issues.map((issue) => issueLine(issue, simple)) : ["- [PROBLEM]"];
  const copies = copyLines(copyTo, ward);

  const lines = simple
    ? [
        `Date: ${formatDay(today)}`,
        "",
        `We live at ${address}.`,
        showHouseholds ? `${Math.floor(households)} households signed this letter.` : null,
        "These problems are not fixed:",
        ...problemLines,
        "",
        `Please send a written repair plan by ${replyDate}.`,
        "For each problem, please write:",
        "- what you will fix",
        "- the start date",
        "- the end date",
        "Please give the plan to every household.",
        copies.length > 0 ? "" : null,
        copies.length > 0 ? "Copies sent to:" : null,
        ...copies,
        "",
        `Residents of ${address}`,
      ]
    : [
        `Date: ${formatDay(today)}`,
        "To: Building management and owner",
        `From: Residents of ${address}`,
        "",
        `We are residents of ${address}.`,
        showHouseholds ? `Residents of ${Math.floor(households)} households signed this letter.` : null,
        "",
        "These problems are not fixed:",
        ...problemLines,
        "",
        `We request a written repair plan by ${replyDate}.`,
        "For each problem, the plan should list:",
        "- the repair work",
        "- the date the work will start",
        "- the date the work will be finished",
        "",
        "Please give the plan to every household in the building.",
        copies.length > 0 ? "" : null,
        copies.length > 0 ? "Copies of this letter were sent to:" : null,
        ...copies,
        "",
        `Residents of ${address}`,
      ];

  return lines.filter((line): line is string => line !== null).join("\n");
};

const letterDescriptionPrefixes: Record<LetterKind, string> = {
  management: "Joint repair plan letter",
  alderperson: "Meeting request to the alderperson",
};

/** Short description saved with the ledger record for this letter. */
export const describeBuildingLetter = (issueCount: number, kind: LetterKind = "management") =>
  `${letterDescriptionPrefixes[kind]}: ${issueCount} ${issueCount === 1 ? "problem" : "problems"}`;

/** True for the ledger record of a saved letter. A letter is not a problem to list in the next letter. */
export const isSavedBuildingLetter = (issueDescription: string | undefined) =>
  Object.values(letterDescriptionPrefixes).some((prefix) => Boolean(issueDescription?.startsWith(prefix)));
