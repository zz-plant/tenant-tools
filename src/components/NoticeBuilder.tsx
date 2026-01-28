import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  Radio,
  RadioGroup as BaseRadioGroup,
  Select,
  Switch,
  Tabs,
} from "./ui";
import {
  fieldDefinitions,
  issue311Guidance,
  issueFieldMap,
  issueOptions,
  meaningMap,
  stages,
  zoneOptions,
} from "../data/noticeData";
import { defaultBuildingOptions, type BuildingOption } from "../data/buildings";
import { getRuleCardsForIssue } from "../data/rules";
import { portfolioOptions } from "../data/portfolioOptions";
import WaitlistPanel from "./WaitlistPanel";
import { buildExportSummary, type ExportAudience } from "../lib/exportSummary";
import { detailCharacterLimit, ticketNumberCharacterLimit, type SubmissionStatus } from "../lib/submissions";

const initialState = {
  building: "",
  zone: "",
  issue: "",
  stage: "A",
  exportStatus: "open",
  language: "en",
  portfolio: "continuum",
  simpleEnglish: false,
  autoDates: true,
  startDate: "",
  firstMessageDate: "",
  today: "",
  time: "",
  temp: "",
  eventDate: "",
  eventDates: "",
  eventDateTime: "",
  moveOutDate: "",
  pestType: "",
  commonArea: "",
  lockoutAction: "",
  location: "",
  issueDescription: "",
  attachment: "",
  ticketDate: "",
  ticketNumber: "",
  planChoice: "keep_open",
};

type Stage = "A" | "B" | "C";
type PlanChoice = "keep_open" | "hire_professional" | "end_lease";

type SimilarIssue = {
  id: string;
  issueLabel: string;
  startDate: string;
  reportCount: number;
  zone?: string;
};

type FormState = typeof initialState;

const steps = [
  {
    id: 1,
    title: "Step 1",
    label: "Basics",
    description: "Pick your building, issue, and notice stage.",
  },
  {
    id: 2,
    title: "Step 2",
    label: "Issue details",
    description: "Add issue-specific facts that support your request.",
  },
  {
    id: 3,
    title: "Step 3",
    label: "Dates & language",
    description: "Confirm the timeline and language options.",
  },
  {
    id: 4,
    title: "Step 4",
    label: "Review & send",
    description: "Copy the notice and save your records.",
  },
];

const exportAudienceOptions: Array<{ id: ExportAudience; label: string; description: string }> = [
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

const exportStatusOptions: Array<{ id: SubmissionStatus; label: string; description: string }> = [
  {
    id: "open",
    label: "Open",
    description: "The issue is still happening.",
  },
  {
    id: "resolved",
    label: "Resolved",
    description: "Repairs are confirmed complete.",
  },
  {
    id: "archived",
    label: "Archived",
    description: "The record is closed for now.",
  },
];

const planChoiceOptions: Array<{ id: PlanChoice; label: string; description: string; caution?: string }> = [
  {
    id: "keep_open",
    label: "Documentation only",
    description: "I want to document the issue before choosing a next step.",
  },
  {
    id: "hire_professional",
    label: "Consider hiring a professional",
    description: "I may want to arrange a repair and request reimbursement later.",
    caution: "Only do this if local rules allow. Get advice first.",
  },
  {
    id: "end_lease",
    label: "Consider ending the lease",
    description: "I may want to end the lease if the issue stays unresolved.",
    caution: "Check local rules and notice deadlines first.",
  },
];

const detailEntries = Object.entries(fieldDefinitions);

const RadioGroup = {
  Root: BaseRadioGroup,
  Item: Radio.Root,
};

const evidenceSafetyChecklist = [
  "Do not upload faces.",
  "Do not upload names, mail labels, or unit numbers.",
  "Do not upload leases or ID documents.",
];

const detailWarningThreshold = detailCharacterLimit - 40;

const issueIcons: Record<string, React.ReactNode> = {
  heat: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Heat issue">
      <path d="M32 10C24 20 40 26 40 38c0 6-4 12-8 12s-8-6-8-12c0-6 4-10 8-16z" fill="#f6b352" />
      <path d="M32 10C24 20 40 26 40 38c0 6-4 12-8 12s-8-6-8-12c0-6 4-10 8-16z" fill="none" stroke="#c46a2a" strokeWidth="2" />
    </svg>
  ),
  leak: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Water leak issue">
      <path d="M32 10C24 22 18 28 18 38a14 14 0 0 0 28 0c0-10-6-16-14-28z" fill="#7bb5ff" />
      <path d="M32 10C24 22 18 28 18 38a14 14 0 0 0 28 0c0-10-6-16-14-28z" fill="none" stroke="#3a6fb0" strokeWidth="2" />
    </svg>
  ),
  pests: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Pest issue">
      <ellipse cx="32" cy="34" rx="10" ry="14" fill="#cfe8c6" stroke="#4a7d4f" strokeWidth="2" />
      <circle cx="26" cy="22" r="4" fill="#cfe8c6" stroke="#4a7d4f" strokeWidth="2" />
      <circle cx="38" cy="22" r="4" fill="#cfe8c6" stroke="#4a7d4f" strokeWidth="2" />
      <path d="M22 40l-8 4M42 40l8 4M22 28l-8-4M42 28l8-4" stroke="#4a7d4f" strokeWidth="2" />
    </svg>
  ),
  entry: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Entry issue">
      <rect x="18" y="12" width="28" height="40" rx="2" fill="#f4d1c5" stroke="#a95b4a" strokeWidth="2" />
      <circle cx="38" cy="32" r="2" fill="#a95b4a" />
      <rect x="14" y="10" width="36" height="44" rx="3" fill="none" stroke="#a95b4a" strokeWidth="2" />
    </svg>
  ),
  common: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Common area issue">
      <rect x="12" y="12" width="40" height="40" rx="4" fill="#d4e1ff" stroke="#4b6fa9" strokeWidth="2" />
      <rect x="20" y="20" width="8" height="8" fill="#ffffff" stroke="#4b6fa9" />
      <rect x="36" y="20" width="8" height="8" fill="#ffffff" stroke="#4b6fa9" />
      <rect x="20" y="34" width="8" height="8" fill="#ffffff" stroke="#4b6fa9" />
      <rect x="36" y="34" width="8" height="8" fill="#ffffff" stroke="#4b6fa9" />
    </svg>
  ),
  "no-timeline": (
    <svg viewBox="0 0 64 64" role="img" aria-label="No timeline issue">
      <rect x="16" y="10" width="32" height="44" rx="4" fill="#f6e2b8" stroke="#b0823e" strokeWidth="2" />
      <path d="M22 24h20M22 32h20M22 40h14" stroke="#b0823e" strokeWidth="2" />
    </svg>
  ),
  deposit: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Deposit issue">
      <circle cx="32" cy="32" r="16" fill="#ffe3a3" stroke="#b67a2b" strokeWidth="2" />
      <path d="M28 26h8v12h-8z" fill="#b67a2b" />
      <path d="M32 22v20" stroke="#b67a2b" strokeWidth="2" />
    </svg>
  ),
  lockout: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Lockout issue">
      <rect x="18" y="28" width="28" height="22" rx="4" fill="#f0ccd1" stroke="#9a4454" strokeWidth="2" />
      <path d="M24 28v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#9a4454" strokeWidth="2" />
      <circle cx="32" cy="38" r="3" fill="#9a4454" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 64 64" role="img" aria-label="Building-wide issue">
      <rect x="14" y="14" width="36" height="36" rx="4" fill="#dfe9f5" stroke="#5a7aa6" strokeWidth="2" />
      <rect x="22" y="22" width="6" height="6" fill="#ffffff" stroke="#5a7aa6" />
      <rect x="36" y="22" width="6" height="6" fill="#ffffff" stroke="#5a7aa6" />
      <rect x="22" y="34" width="6" height="6" fill="#ffffff" stroke="#5a7aa6" />
      <rect x="36" y="34" width="6" height="6" fill="#ffffff" stroke="#5a7aa6" />
    </svg>
  ),
};

const formatIssueLabel = (label: string) => label.replace(/^[^a-zA-Z0-9]+\s*/, "");

const formatDate = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const formatCalendarDate = (date: Date) => date.toISOString().slice(0, 10).replaceAll("-", "");

const getCurrentTime = (date: Date) =>
  `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const fillTemplate = (template: string, values: Record<string, string>) => {
  let text = template;
  Object.entries(values).forEach(([key, value]) => {
    text = text.replaceAll(`[${key}]`, value);
  });
  return text;
};

const formatTimelineDate = (value: string) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

type NoticeBuilderProps = {
  buildingOptions?: BuildingOption[];
};

const NoticeBuilder = ({ buildingOptions = defaultBuildingOptions }: NoticeBuilderProps) => {
  const [formState, setFormState] = useState<FormState>(() => {
    const today = new Date();
    const formatted = formatDate(today);
    return {
      ...initialState,
      today: formatted,
      startDate: formatted,
      time: getCurrentTime(today),
    };
  });
  const [buildingKey, setBuildingKey] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key") || "";
    setBuildingKey(key.trim());
  }, []);
  const [currentStep, setCurrentStep] = useState(1);
  const [plainMeaningVisible, setPlainMeaningVisible] = useState(false);
  const [impactCount] = useState(1);
  const [copyLabel, setCopyLabel] = useState("Copy text");
  const [summaryCopyLabel, setSummaryCopyLabel] = useState("Copy summary");
  const [saveLabel, setSaveLabel] = useState("Save to ledger");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [linkCopyLabel, setLinkCopyLabel] = useState("Copy link");
  const [repeatLabel, setRepeatLabel] = useState("Repeat with today's date");
  const [exportAudience, setExportAudience] = useState<ExportAudience>("inspector");
  const [similarIssues, setSimilarIssues] = useState<SimilarIssue[]>([]);
  const [similarNotice, setSimilarNotice] = useState("");
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState("");
  const [dismissSimilar, setDismissSimilar] = useState(false);
  const [reportingIssueId, setReportingIssueId] = useState<string | null>(null);
  const [noticeStatusMessage, setNoticeStatusMessage] = useState("");
  const [exportStatusMessage, setExportStatusMessage] = useState("");
  const [linkStatusMessage, setLinkStatusMessage] = useState("");

  const missingBasics = useMemo(() => {
    const missing: string[] = [];
    if (!formState.building) {
      missing.push("Choose a building");
    }
    if (!formState.issue) {
      missing.push("Choose an issue");
    }
    return missing;
  }, [formState.building, formState.issue]);

  const isStep1Complete = Boolean(formState.building && formState.issue);
  const isNoticeReady = missingBasics.length === 0;
  const noticeReadiness = isNoticeReady
    ? {
        title: "Notice ready",
        detail: "Review the summary and copy the message when you are ready.",
      }
    : {
        title: "Finish the basics",
        detail: "Choose a building and issue to unlock the notice preview.",
      };
  const canSaveLedger = Boolean(formState.building && formState.issue && buildingKey);

  const updateField =
    (key: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value, type } = event.currentTarget;
      const isCheckbox = type === "checkbox" && "checked" in event.currentTarget;
      setFormState((prev) => ({
        ...prev,
        [key]: isCheckbox ? event.currentTarget.checked : value,
      }));
    };

  const updateSelect =
    (key: keyof FormState) =>
    (value: string | null) => {
      setFormState((prev) => ({
        ...prev,
        [key]: value ?? "",
      }));
    };

  const updateChecked =
    (key: keyof FormState) =>
    (checked: boolean) => {
      setFormState((prev) => ({
        ...prev,
        [key]: checked,
      }));
    };

  const selectedIssue = issueOptions.find((option) => option.id === formState.issue);
  const issueFields = issueFieldMap[formState.issue] || [];
  const stageLabel = stages[formState.stage as Stage] || stages.A;

  const selectedZone = zoneOptions.find((option) => option.id === formState.zone);
  const selectedAudience =
    exportAudienceOptions.find((option) => option.id === exportAudience) || exportAudienceOptions[0];
  const selectedExportStatus =
    exportStatusOptions.find((option) => option.id === formState.exportStatus) || exportStatusOptions[0];
  const selectedPortfolio = portfolioOptions.find((option) => option.id === formState.portfolio);
  const selectedPlanChoice =
    planChoiceOptions.find((option) => option.id === formState.planChoice) || planChoiceOptions[0];

  const buildNoticeText = (state: FormState) => {
    if (!selectedIssue) {
      return "";
    }

    const template = state.simpleEnglish
      ? selectedIssue.simple.en
      : selectedIssue.notices[state.stage]?.[state.language] ||
        selectedIssue.notices[state.stage]?.en ||
        selectedIssue.notices.A.en;

    const values: Record<string, string> = {
      ADDRESS: state.building || "[ADDRESS]",
      ISSUE: state.issueDescription || "[ISSUE]",
      LOCATION: state.location || "[LOCATION]",
      "START DATE": state.startDate || "[START DATE]",
      TODAY: state.today || "[TODAY]",
      TIME: state.time || "[TIME]",
      TEMP: state.temp || "[TEMP]",
      "DATE OF FIRST MESSAGE": state.firstMessageDate || "[DATE OF FIRST MESSAGE]",
      "MOVE-OUT DATE": state.moveOutDate || "[MOVE-OUT DATE]",
      DATE: state.eventDate || "[DATE]",
      DATES: state.eventDates || "[DATES]",
      "DATE/TIME": state.eventDateTime || "[DATE/TIME]",
      "PHOTO/VIDEO": state.attachment || "[PHOTO/VIDEO]",
      "ROACHES/RATS/BEDBUGS": state.pestType || "[ROACHES/RATS/BEDBUGS]",
      "ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM":
        state.commonArea || "[ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM]",
      "LOCK ME OUT / SHUT OFF UTILITIES":
        state.lockoutAction || "[LOCK ME OUT / SHUT OFF UTILITIES]",
    };

    if (state.autoDates) {
      const today = state.today || formatDate(new Date());
      values["START DATE"] = state.startDate || today;
      values.TODAY = today;
    }

    return fillTemplate(template, values);
  };

  useEffect(() => {
    if (!formState.autoDates) {
      return;
    }
    const today = new Date();
    const formatted = formatDate(today);
    setFormState((prev) => ({
      ...prev,
      today: prev.today || formatted,
      startDate: prev.startDate || formatted,
      time: prev.time || getCurrentTime(today),
    }));
  }, [formState.autoDates]);

  const noticeText = useMemo(() => {
    return buildNoticeText(formState);
  }, [formState, selectedIssue]);

  const meaningItems = meaningMap[formState.stage] || meaningMap.A;

  const daysOpen = useMemo(() => {
    const startDate = formState.startDate ? new Date(formState.startDate) : null;
    const todayDate = formState.today ? new Date(formState.today) : new Date(formatDate(new Date()));
    if (!startDate) {
      return 0;
    }
    return Math.max(0, Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  }, [formState.startDate, formState.today]);

  const nextSteps = useMemo(() => {
    const startDate = formState.startDate ? new Date(formState.startDate) : null;
    const todayDate = formState.today ? new Date(formState.today) : new Date(formatDate(new Date()));
    const daysOpen = startDate
      ? Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const issueLabel = selectedIssue?.label || "maintenance issue";
    const buildingLabel = formState.building || "your building";

    const steps = [
      {
        label: "Common path: first written notice window",
        unlockDay: 0,
        calendarLabel: "Initial notice window",
        detail:
          "Common paths tenants encounter start with a written record. A risk is missing dates, copies, or who received it.",
      },
      {
        label: "Common path: follow-up window after a few days",
        unlockDay: 3,
        calendarLabel: "Follow-up notice window",
        detail:
          "Common paths tenants encounter include a follow-up. A risk is a documentation gap when dates or prior messages are not linked.",
      },
      {
        label: "Common path: final reminder window",
        unlockDay: 6,
        calendarLabel: "Final reminder window",
        detail:
          "Common paths tenants encounter include a last reminder. A risk is unclear timelines when records are incomplete.",
      },
    ];

    return steps.map((step) => {
      const reminderDate = startDate ? addDays(startDate, step.unlockDay) : null;
      const calendarDate = reminderDate ? formatCalendarDate(reminderDate) : "";
      const calendarLink = reminderDate
        ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            `${step.calendarLabel}: ${issueLabel}`
          )}&details=${encodeURIComponent(
            `${step.detail}\nBuilding: ${buildingLabel}\nIssue: ${issueLabel}`
          )}&dates=${calendarDate}/${calendarDate}`
        : "";

      return {
        ...step,
        unlocked: daysOpen >= step.unlockDay,
        remaining: step.unlockDay - daysOpen,
        calendarLink,
        reminderDateLabel: reminderDate ? formatDate(reminderDate) : "Add a start date",
      };
    });
  }, [formState.startDate, formState.today, formState.building, selectedIssue?.label]);

  const exportSummary = useMemo(() => {
    const building = formState.building || "[ADDRESS]";
    const portfolioLabel = selectedPortfolio?.label || "Not listed";
    const issueLabel = selectedIssue?.label || "[ISSUE TYPE]";
    const zoneLabel = selectedZone?.label || "Not listed";
    const statusLabel = selectedExportStatus.label;

    const issueDetails = issueFields
      .map((fieldKey) => {
        const field = fieldDefinitions[fieldKey];
        const value = String(formState[fieldKey as keyof FormState] ?? "").trim();
        if (!field || !value) {
          return null;
        }
        return { key: fieldKey, label: field.label, value };
      })
      .filter((detail): detail is { key: string; label: string; value: string } => Boolean(detail));

    return buildExportSummary({
      exportAudience,
      building,
      portfolioLabel,
      issueLabel,
      zoneLabel,
      statusLabel,
      stageLabel,
      startDate: formState.startDate || "[START DATE]",
      reportDate: formState.today || "[TODAY]",
      daysOpen,
      impactCount,
      language: formState.language,
      issueDetails,
      evidence: formState.attachment ? formState.attachment : "None listed",
      ticketDate: formState.ticketDate || undefined,
      ticketNumber: formState.ticketNumber || undefined,
    });
  }, [
    formState.attachment,
    formState.building,
    formState.exportStatus,
    formState.language,
    formState.portfolio,
    formState.startDate,
    formState.today,
    impactCount,
    issueFields,
    daysOpen,
    selectedIssue?.label,
    stageLabel,
    exportAudience,
    formState.ticketDate,
    formState.ticketNumber,
    selectedZone?.label,
    selectedPortfolio?.label,
    selectedExportStatus.label,
  ]);

  const handleCopy = async () => {
    if (!noticeText) {
      return;
    }
    await navigator.clipboard.writeText(noticeText);
    setCopyLabel("Copied!");
    setNoticeStatusMessage("Notice copied.");
    setTimeout(() => setCopyLabel("Copy text"), 1500);
    setTimeout(() => setNoticeStatusMessage(""), 2000);
  };

  const handleSummaryCopy = async () => {
    await navigator.clipboard.writeText(exportSummary);
    setSummaryCopyLabel("Copied!");
    setExportStatusMessage("Summary copied.");
    setTimeout(() => setSummaryCopyLabel("Copy summary"), 1500);
    setTimeout(() => setExportStatusMessage(""), 2000);
  };

  const handleSummaryDownload = () => {
    const blob = new Blob([exportSummary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeBuilding = (formState.building || "building").toLowerCase().replace(/\s+/g, "-");
    anchor.href = url;
    anchor.download = `${safeBuilding}-summary-${formatDate(new Date())}.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setExportStatusMessage("Download started.");
    setTimeout(() => setExportStatusMessage(""), 2000);
  };

  const handleLedgerSave = async () => {
    if (!formState.building || !formState.issue) {
      setSaveStatus("error");
      setSaveError("Select a building and issue before saving.");
      return;
    }
    if (!buildingKey) {
      setSaveStatus("error");
      setSaveLabel("Save to ledger");
      setSaveError("Add your building key to the URL before saving.");
      return;
    }

    setSaveStatus("saving");
    setSaveError("");
    setSaveLabel("Saving...");

    const issueDetails = issueFields.reduce<Record<string, string>>((acc, fieldKey) => {
      const rawValue = String(formState[fieldKey as keyof FormState] ?? "").trim();
      if (rawValue) {
        acc[fieldKey] = rawValue;
      }
      return acc;
    }, {});

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (buildingKey) {
        headers["x-building-key"] = buildingKey;
      }
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          building: formState.building,
          issue: formState.issue,
          stage: formState.stage,
          language: formState.language,
          portfolio: formState.portfolio,
          startDate: formState.startDate,
          reportDate: formState.today,
          reportCount: impactCount,
          simpleEnglish: formState.simpleEnglish,
          zone: formState.zone,
          firstMessageDate: formState.firstMessageDate,
          ticketDate: formState.ticketDate,
          ticketNumber: formState.ticketNumber,
          issueDetails,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = Array.isArray(payload?.details)
          ? payload.details.filter((item): item is string => typeof item === "string")
          : [];
        const detailText = details.length > 0 ? ` ${details.join(" ")}` : "";
        throw new Error(`${payload?.error || "Unable to save right now."}${detailText}`);
      }

      setSubmissionUrl(payload.url || "");
      setSaveStatus("saved");
      setSaveLabel("Saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveLabel("Save to ledger");
      setSaveError(error instanceof Error ? error.message : "We could not save the ledger entry.");
    }
  };

  const handleCopyLink = async () => {
    if (!submissionUrl) {
      return;
    }
    await navigator.clipboard.writeText(`${window.location.origin}${submissionUrl}`);
    setLinkCopyLabel("Link copied");
    setLinkStatusMessage("Permalink copied.");
    setTimeout(() => setLinkCopyLabel("Copy link"), 1500);
    setTimeout(() => setLinkStatusMessage(""), 2000);
  };

  const handleReset = () => {
    const today = new Date();
    const formatted = formatDate(today);
    setFormState({
      ...initialState,
      today: formatted,
      startDate: formatted,
      time: getCurrentTime(today),
    });
    setCurrentStep(1);
    setPlainMeaningVisible(false);
    setCopyLabel("Copy text");
    setSummaryCopyLabel("Copy summary");
    setSaveLabel("Save to ledger");
    setSaveStatus("idle");
    setSaveError("");
    setSubmissionUrl("");
    setLinkCopyLabel("Copy link");
    setNoticeStatusMessage("");
    setExportStatusMessage("");
    setLinkStatusMessage("");
    setRepeatLabel("Repeat with today's date");
    setExportAudience("inspector");
    setSimilarIssues([]);
    setSimilarNotice("");
    setSimilarError("");
    setDismissSimilar(false);
  };

  const handleRepeatNotice = async () => {
    if (!noticeText) {
      return;
    }
    const today = formatDate(new Date());
    const nextState = {
      ...formState,
      today,
    };
    const repeatedText = buildNoticeText(nextState);
    await navigator.clipboard.writeText(repeatedText);
    setFormState(nextState);
    setRepeatLabel("Copied with today's date");
    setNoticeStatusMessage("Notice copied with today's date.");
    setTimeout(() => setRepeatLabel("Repeat with today's date"), 1600);
    setTimeout(() => setNoticeStatusMessage(""), 2000);
  };

  const handleAddToExisting = async (id: string) => {
    setReportingIssueId(id);
    setSimilarNotice("");
    setSimilarError("");
    if (!buildingKey) {
      setSimilarError("Add your building key to the URL before adding a report.");
      setReportingIssueId(null);
      return;
    }
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      headers["x-building-key"] = buildingKey;
      const response = await fetch(`/api/submissions/${id}/report`, {
        method: "POST",
        headers,
        body: JSON.stringify({ increment: 1 }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "We could not update the report count.");
      }
      setSimilarIssues((prev) =>
        prev.map((issue) =>
          issue.id === id ? { ...issue, reportCount: payload.reportCount ?? issue.reportCount } : issue
        )
      );
      setSimilarNotice("Your report was added to the existing issue.");
      setDismissSimilar(true);
    } catch (error) {
      setSimilarError(error instanceof Error ? error.message : "We could not add your report.");
    } finally {
      setReportingIssueId(null);
    }
  };

  const summaryItems = [
    { label: "Building", value: formState.building || "Select a building" },
    { label: "Portfolio", value: selectedPortfolio?.label || "Not listed" },
    { label: "Issue", value: selectedIssue?.label || "Select an issue" },
    { label: "Zone", value: selectedZone?.label || "Not listed" },
    { label: "Stage", value: stageLabel },
    { label: "Export status", value: selectedExportStatus.label },
    { label: "Language", value: formState.language.toUpperCase() },
    { label: "Start date", value: formState.startDate || "Add a start date" },
    { label: "Today", value: formState.today || "Add today's date" },
    { label: "Plain language", value: formState.simpleEnglish ? "On" : "Off" },
    { label: "Plan goal", value: selectedPlanChoice.label },
  ];
  const noticeLanguageLabel = formState.simpleEnglish
    ? "Very simple English"
    : formState.language === "en"
      ? "English"
      : formState.language.toUpperCase();

  const detailSummaryItems = useMemo(
    () =>
      detailEntries
        .map(([key, field]) => {
          const value = String(formState[key as keyof FormState] ?? "").trim();
          if (!value) {
            return null;
          }
          return { label: field.label, value };
        })
        .filter(Boolean) as Array<{ label: string; value: string }>,
    [formState]
  );

  const savedMetaItems = [
    selectedPortfolio?.label ? { label: "Portfolio", value: selectedPortfolio.label } : null,
    selectedZone?.label ? { label: "Zone", value: selectedZone.label } : null,
    formState.ticketDate ? { label: "311 ticket date", value: formState.ticketDate } : null,
    formState.ticketNumber ? { label: "311 ticket number", value: formState.ticketNumber } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const timelineEntries = useMemo(() => {
    const entries: Array<{ label: string; date: string }> = [];
    if (formState.startDate) {
      entries.push({ label: "Issue started", date: formState.startDate });
    }
    if (formState.stage === "A") {
      if (formState.today) {
        entries.push({ label: "Notice sent", date: formState.today });
      }
    }
    if (formState.stage === "B" || formState.stage === "C") {
      if (formState.firstMessageDate) {
        entries.push({ label: "First notice sent", date: formState.firstMessageDate });
      }
      if (formState.today) {
        entries.push({
          label: formState.stage === "B" ? "Follow-up sent" : "Final notice sent",
          date: formState.today,
        });
      }
    }
    if (formState.ticketDate) {
      entries.push({ label: "311 ticket logged", date: formState.ticketDate });
    }
    return entries.sort((a, b) => a.date.localeCompare(b.date));
  }, [formState.firstMessageDate, formState.startDate, formState.stage, formState.ticketDate, formState.today]);

  const issueGuidance = formState.issue ? issue311Guidance[formState.issue] : null;
  const guidanceScript = issueGuidance
    ? issueGuidance.script
        .replace("[START DATE]", formState.startDate || "[START DATE]")
        .replace("[LOCATION]", formState.location || "[LOCATION]")
        .replace("[DATE]", formState.eventDate || "[DATE]")
    : "";

  const ruleCards = useMemo(() => getRuleCardsForIssue(formState.issue), [formState.issue]);
  const ruleSources = useMemo(() => {
    const sourceMap = new Map<string, string>();

    ruleCards.forEach((card) => {
      card.sources.forEach((source) => {
        if (!sourceMap.has(source.url)) {
          sourceMap.set(source.url, source.title);
        }
      });
    });

    return Array.from(sourceMap, ([url, title]) => ({ url, title }));
  }, [ruleCards]);

  useEffect(() => {
    if (!formState.building || !formState.issue) {
      setSimilarIssues([]);
      setSimilarError("");
      return;
    }
    if (!buildingKey) {
      setSimilarIssues([]);
      setSimilarError("Add your building key to the URL to check for similar issues.");
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      building: formState.building,
      issue: formState.issue,
      startDate: formState.startDate || formatDate(new Date()),
    });
    if (formState.zone) {
      params.set("zone", formState.zone);
    }
    params.set("key", buildingKey);

    setSimilarLoading(true);
    setSimilarError("");
    const run = async () => {
      try {
        const response = await fetch(`/api/submissions/similar?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "We could not check for similar issues right now.");
        }
        if (Array.isArray(payload?.matches)) {
          setSimilarIssues(payload.matches);
          return;
        }
        setSimilarIssues([]);
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") {
          return;
        }
        setSimilarError(error instanceof Error ? error.message : "We could not check for similar issues right now.");
      } finally {
        setSimilarLoading(false);
      }
    };
    run();

    return () => controller.abort();
  }, [buildingKey, formState.building, formState.issue, formState.startDate, formState.zone]);

  useEffect(() => {
    setDismissSimilar(false);
    setSimilarNotice("");
  }, [buildingKey, formState.building, formState.issue, formState.zone, formState.startDate]);

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="hero">
        <div className="hero-main">
          <p className="eyebrow">Building Ledger</p>
          <h1>Tenant Notice Builder</h1>
          <p className="tagline">Write a short, dated notice in four steps.</p>
          <div className="tag-row">
            <span>No names saved</span>
            <span>Short facts only</span>
          </div>
        </div>
      </header>

      <main className="layout" id="main">
        <div className="flow">
          <section className="panel">
            <div className="step-header">
              <h2>Build your notice</h2>
              <p className="helper">Start with the basics and move step by step.</p>
              <p className="helper">Step {currentStep} of {steps.length}</p>
              <p className="helper">Privacy reminder: Do not include names or unit numbers.</p>
              <div className="quick-guide">
                <div>
                  <p className="quick-title">Start here</p>
                  <ul className="quick-list">
                    <li>Choose a building.</li>
                    <li>Choose an issue type.</li>
                    <li>Confirm the notice stage.</li>
                  </ul>
                </div>
                <div className="quick-warning">
                  <p className="helper">
                    <strong>Safety note:</strong> Write short facts. Do not include names or unit numbers.
                  </p>
                </div>
                {missingBasics.length > 0 && (
                  <div className="quick-needed">
                    <p className="helper">
                      <strong>Needed to continue:</strong>
                    </p>
                    <ul className="quick-list">
                      {missingBasics.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <Tabs.Root
              value={String(currentStep)}
              onValueChange={(value) => {
                if (value) {
                  setCurrentStep(Number(value));
                }
              }}
            >
              <Tabs.List className="step-nav">
                {steps.map((step) => (
                  <Tabs.Tab
                    key={step.id}
                    value={String(step.id)}
                    className={`step-button ${currentStep === step.id ? "active" : ""}`}
                    aria-current={currentStep === step.id ? "step" : undefined}
                  >
                    <span className="step-title">{step.title}</span>
                    <span className="step-label">{step.label}</span>
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              <p className="helper">{steps[currentStep - 1].description}</p>

              <form className="form-grid">
                <Tabs.Panel value="1">
                  <label>
                    Building
                    <Select.Root
                      value={formState.building || null}
                      onValueChange={(value) =>
                        setFormState((prev) => ({
                          ...prev,
                          building: value ?? "",
                          portfolio: value ? "continuum" : prev.portfolio,
                        }))
                      }
                      required
                    >
                      <Select.Trigger className="select-trigger" aria-label="Building">
                        <Select.Value placeholder="Select building" />
                        <Select.Icon className="select-icon">
                          <span aria-hidden="true">▾</span>
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner className="select-positioner">
                            <Select.Popup className="select-popup">
                              <Select.List className="select-list">
                                {buildingOptions.map((building) => {
                                  const isComingSoon = building.status === "coming-soon";
                                  return (
                                    <Select.Item
                                      key={building.id}
                                      value={building.id}
                                      className="select-item"
                                      disabled={isComingSoon}
                                    >
                                      <Select.ItemText>
                                        {building.id} {isComingSoon ? "(Coming soon)" : ""}
                                      </Select.ItemText>
                                      <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                                    </Select.Item>
                                  );
                                })}
                              </Select.List>
                            </Select.Popup>
                          </Select.Positioner>
                        </Select.Portal>
                    </Select.Root>
                  </label>

                  <div className="issue-gallery">
                    <div>
                      <h3 id="issue-gallery-title">Issue gallery</h3>
                      <p className="helper">Select one issue type to unlock the notice templates.</p>
                    </div>
                    <RadioGroup.Root
                      className="issue-grid"
                      aria-labelledby="issue-gallery-title"
                      value={formState.issue}
                      onValueChange={(value) => {
                        if (typeof value !== "string") {
                          return;
                        }
                        setFormState((prev) => ({ ...prev, issue: value }));
                      }}
                      required
                    >
                      {issueOptions.map((option) => (
                        <RadioGroup.Item
                          key={option.id}
                          render={<div />}
                          className={`issue-card ${formState.issue === option.id ? "active" : ""}`}
                          value={option.id}
                          aria-label={formatIssueLabel(option.label)}
                        >
                          <div className="issue-icon">{issueIcons[option.id]}</div>
                          <p className="issue-label">{formatIssueLabel(option.label)}</p>
                        </RadioGroup.Item>
                      ))}
                    </RadioGroup.Root>
                  </div>

                  <label>
                    Issue location zone (optional)
                    <Select.Root value={formState.zone || null} onValueChange={updateSelect("zone")}>
                      <Select.Trigger className="select-trigger" aria-label="Issue location zone">
                        <Select.Value placeholder="Select zone" />
                        <Select.Icon className="select-icon">
                          <span aria-hidden="true">▾</span>
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner className="select-positioner">
                          <Select.Popup className="select-popup">
                            <Select.List className="select-list">
                              {zoneOptions.map((option) => (
                                <Select.Item key={option.id} value={option.id} className="select-item">
                                  <Select.ItemText>{option.label}</Select.ItemText>
                                  <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                                </Select.Item>
                              ))}
                            </Select.List>
                          </Select.Popup>
                        </Select.Positioner>
                      </Select.Portal>
                    </Select.Root>
                    <p className="helper">Choose a general area only. Do not enter unit numbers.</p>
                  </label>

                  {similarIssues.length > 0 && !dismissSimilar && (
                    <div className="similar-issue-card">
                      <div>
                        <h3>Same issue?</h3>
                        <p className="helper">
                          There is already a recent issue like this in the last few weeks. Would you like to add your
                          report to it instead?
                        </p>
                      </div>
                      <ul className="similar-issue-list">
                        {similarIssues.map((issue) => (
                          <li key={issue.id}>
                            <div>
                              <p className="similar-issue-title">{issue.issueLabel}</p>
                              <p className="helper">
                                Started {issue.startDate}. Reports: {issue.reportCount}.
                              </p>
                            </div>
                            <div className="similar-issue-actions">
                              <a
                                className="button button-secondary"
                                href={`/submissions/${issue.id}${buildingKey ? `?key=${encodeURIComponent(buildingKey)}` : ""}`}
                              >
                                View summary
                              </a>
                              <Button
                                className="button"
                                type="button"
                                onClick={() => handleAddToExisting(issue.id)}
                                disabled={reportingIssueId === issue.id}
                              >
                                {reportingIssueId === issue.id ? "Adding..." : "Me too"}
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {similarLoading && <p className="helper">Checking recent issues...</p>}
                      {similarNotice && (
                        <p className="similar-issue-success" role="status" aria-live="polite">
                          {similarNotice}
                        </p>
                      )}
                      {similarError && (
                        <p className="similar-issue-error" role="alert">
                          {similarError}
                        </p>
                      )}
                      <div className="similar-issue-footer">
                        <Button
                          className="link-button"
                          type="button"
                          onClick={() => setDismissSimilar(true)}
                        >
                          Keep this as a new issue
                        </Button>
                      </div>
                    </div>
                  )}

                  <label>
                    Notice stage
                    <Select.Root value={formState.stage} onValueChange={updateSelect("stage")} required>
                      <Select.Trigger className="select-trigger" aria-label="Notice stage">
                        <Select.Value placeholder="Select stage" />
                        <Select.Icon className="select-icon">
                          <span aria-hidden="true">▾</span>
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner className="select-positioner">
                          <Select.Popup className="select-popup">
                            <Select.List className="select-list">
                              <Select.Item value="A" className="select-item">
                                <Select.ItemText>A. {stages.A}</Select.ItemText>
                                <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                              </Select.Item>
                              <Select.Item value="B" className="select-item">
                                <Select.ItemText>B. {stages.B}</Select.ItemText>
                                <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                              </Select.Item>
                              <Select.Item value="C" className="select-item">
                                <Select.ItemText>C. {stages.C}</Select.ItemText>
                                <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                              </Select.Item>
                            </Select.List>
                          </Select.Popup>
                        </Select.Positioner>
                      </Select.Portal>
                    </Select.Root>
                  </label>
                </Tabs.Panel>

                <Tabs.Panel value="2">
                  {issueFields.length === 0 && (
                    <p className="helper">Select an issue to reveal the specific details to include.</p>
                  )}
                  {issueFields.map((fieldKey) => {
                    const field = fieldDefinitions[fieldKey];
                    if (!field) {
                      return null;
                    }
                    const isAttachmentField = fieldKey === "attachment";
                    const fieldValue = String(formState[fieldKey as keyof FormState] ?? "");
                    const trimmedLength = fieldValue.trim().length;
                    const isTextField = !field.type;
                    const showLimitWarning = isTextField && trimmedLength >= detailWarningThreshold;
                    const limitText = isTextField
                      ? `Limit: ${detailCharacterLimit} characters${trimmedLength > 0 ? ` (${trimmedLength}/${detailCharacterLimit})` : "."}`
                      : "";
                    const helperId = isTextField ? `detail-${fieldKey}-helper` : undefined;
                    return (
                      <label key={fieldKey}>
                        {field.label}
                        {isAttachmentField && (
                          <div className="evidence-warning" role="note">
                            <p className="evidence-warning-title">Evidence safety check</p>
                            <ul className="evidence-warning-list">
                              {evidenceSafetyChecklist.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Input
                          className="input"
                          type={field.type || "text"}
                          value={fieldValue}
                          onChange={updateField(fieldKey as keyof FormState)}
                          placeholder={field.placeholder}
                          maxLength={isTextField ? detailCharacterLimit : undefined}
                          aria-describedby={helperId}
                        />
                        {isTextField && (
                          <p
                            className={`helper${showLimitWarning ? " helper-warning" : ""}`}
                            id={helperId}
                          >
                            {limitText}
                            {trimmedLength > detailCharacterLimit && " Extra text is removed when saving."}
                          </p>
                        )}
                      </label>
                    );
                  })}
                </Tabs.Panel>

                <Tabs.Panel value="3">
                  <label>
                    Language
                    <Select.Root value={formState.language} onValueChange={updateSelect("language")} required>
                      <Select.Trigger className="select-trigger" aria-label="Language">
                        <Select.Value placeholder="Select language" />
                        <Select.Icon className="select-icon">
                          <span aria-hidden="true">▾</span>
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner className="select-positioner">
                          <Select.Popup className="select-popup">
                            <Select.List className="select-list">
                              <Select.Item value="en" className="select-item">
                                <Select.ItemText>English</Select.ItemText>
                                <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                              </Select.Item>
                              <Select.Item value="es" className="select-item">
                                <Select.ItemText>Español</Select.ItemText>
                                <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                              </Select.Item>
                              <Select.Item value="hi" className="select-item">
                                <Select.ItemText>हिंदी</Select.ItemText>
                                <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                              </Select.Item>
                              <Select.Item value="pl" className="select-item">
                                <Select.ItemText>Polski</Select.ItemText>
                                <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                              </Select.Item>
                            </Select.List>
                          </Select.Popup>
                        </Select.Positioner>
                      </Select.Portal>
                    </Select.Root>
                  </label>

                  <div className="checkbox-row">
                    <label className="checkbox-label">
                      <Checkbox.Root
                        checked={formState.simpleEnglish}
                        onCheckedChange={updateChecked("simpleEnglish")}
                        className="checkbox-root"
                      >
                        <Checkbox.Indicator className="checkbox-indicator">✓</Checkbox.Indicator>
                      </Checkbox.Root>
                      Very simple English
                    </label>
                    <label className="checkbox-label">
                      <Switch.Root
                        checked={formState.autoDates}
                        onCheckedChange={updateChecked("autoDates")}
                        className="switch-root"
                      >
                        <Switch.Thumb className="switch-thumb" />
                      </Switch.Root>
                      Include dates automatically
                    </label>
                  </div>

                  <label>
                    Start date
                    <Input
                      className="input"
                      type="date"
                      value={formState.startDate}
                      onChange={updateField("startDate")}
                    />
                  </label>

                  {(formState.stage === "B" || formState.stage === "C") && (
                    <label>
                      Date of first message (for follow-ups)
                      <Input
                        className="input"
                        type="date"
                        value={formState.firstMessageDate}
                        onChange={updateField("firstMessageDate")}
                      />
                    </label>
                  )}

                  <label>
                    Today
                    <Input
                      className="input"
                      type="date"
                      value={formState.today}
                      onChange={updateField("today")}
                      disabled={formState.autoDates}
                    />
                  </label>

                  <div className="inline-fields">
                    <label>
                      311 ticket date (optional)
                      <Input
                        className="input"
                        type="date"
                        value={formState.ticketDate}
                        onChange={updateField("ticketDate")}
                      />
                    </label>
                    <label>
                      311 ticket number (optional)
                      <Input
                        className="input"
                        value={formState.ticketNumber}
                        onChange={updateField("ticketNumber")}
                        placeholder="Ticket number"
                        maxLength={ticketNumberCharacterLimit}
                      />
                    </label>
                  </div>
                  <p className="helper">Use this only if you already called 311. Do not include names.</p>
                </Tabs.Panel>

                <Tabs.Panel value="4">
                  <p className="helper">
                    Review the preview. Copy the text and save it for your records. Dates and repeated reports help
                    most.
                  </p>
                  <div className="review-actions">
                    <Button className="button" type="button" onClick={handleCopy} disabled={!isNoticeReady}>
                      {copyLabel}
                    </Button>
                    <Button className="button button-secondary" type="button" onClick={handleReset}>
                      Reset form
                    </Button>
                  </div>
                </Tabs.Panel>
              </form>
            </Tabs.Root>

            <div className="step-controls">
              <Button
                className="button button-secondary"
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <Button
                className="button"
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
                disabled={currentStep === steps.length || (currentStep === 1 && !isStep1Complete)}
              >
                Next
              </Button>
            </div>
            {currentStep === 1 && !isStep1Complete && (
              <p className="helper">Choose a building and issue to continue.</p>
            )}
          </section>

          <section className="panel">
            <h2>Issue timeline</h2>
            <p className="helper">Read-only record of key dates for this issue.</p>
            {timelineEntries.length > 0 ? (
              <ul className="timeline">
                {timelineEntries.map((entry) => (
                  <li key={`${entry.label}-${entry.date}`}>
                    <p className="timeline-date">{formatTimelineDate(entry.date)}</p>
                    <p className="timeline-label">{entry.label}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="helper">Add dates to show a timeline.</p>
            )}

            {issueGuidance && (
              <details className="helper-card">
                <summary>Calling 311 for this issue</summary>
                <div className="helper-card-body">
                  <p>
                    <strong>Category to choose:</strong> {issueGuidance.category}
                  </p>
                  <p>
                    <strong>What to say:</strong> {guidanceScript}
                  </p>
                  <p>
                    <strong>What happens next:</strong> {issueGuidance.nextStep}
                  </p>
                </div>
              </details>
            )}

            {ruleSources.length > 0 && (
              <details className="helper-card">
                <summary>Local rules (information only)</summary>
                <div className="helper-card-body">
                  <p className="helper">Short source list for Chicago and Cook County. This is not legal advice.</p>
                  <ul className="rule-sources">
                    {ruleSources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            )}

            <h2>Plan if the issue is not fixed</h2>
            <p className="helper">Choose a goal. This does not give legal advice. Rules vary by city.</p>
            <RadioGroup.Root
              className="plan-options"
              aria-label="Plan goal if the issue is not fixed"
              value={formState.planChoice}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  setFormState((prev) => ({ ...prev, planChoice: value as PlanChoice }));
                }
              }}
            >
              {planChoiceOptions.map((option) => (
                <RadioGroup.Item
                  key={option.id}
                  value={option.id}
                  render={<div />}
                  className={`preset-card ${formState.planChoice === option.id ? "active" : ""}`}
                >
                  <span className="preset-radio" aria-hidden="true">
                    <span className="preset-radio-outer">
                      <span className="preset-radio-indicator" />
                    </span>
                  </span>
                  <div>
                    <p className="preset-title">{option.label}</p>
                    <p className="helper">{option.description}</p>
                    {option.caution && <p className="helper plan-caution">{option.caution}</p>}
                  </div>
                </RadioGroup.Item>
              ))}
            </RadioGroup.Root>

            <h2>What usually happens next</h2>
            <p className="helper">This shows the normal next step based on how long the issue has been open.</p>
            <ul className="next-steps">
              {nextSteps.map((step) => (
                <li key={step.label} className={step.unlocked ? "" : "locked"}>
                  <div className="next-step-row">
                    <div>
                      <p className="next-step-title">
                        {step.unlocked
                          ? step.label
                          : `${step.label} (unlock in ${Math.abs(step.remaining)} days)`}
                      </p>
                      <p className="helper">Reminder date: {step.reminderDateLabel}</p>
                    </div>
                    <a
                      className={`button button-secondary calendar-link ${step.calendarLink ? "" : "disabled"}`}
                      href={step.calendarLink || "#"}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!step.calendarLink}
                      onClick={(event) => {
                        if (!step.calendarLink) {
                          event.preventDefault();
                        }
                      }}
                    >
                      Add to Google Calendar
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            <h3>Community impact</h3>
            <div className="impact">
              <div className="impact-summary">
                <p className="impact-count">{impactCount}</p>
                <div>
                  <p className="impact-label">Total reports</p>
                  <p className="impact-hint">
                    Reports start at 1. Use “Me too” on an existing issue to add your report.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="panel panel-highlight preview-panel">
          <div className="output-header">
            <h2>Generated notice</h2>
            <div className="output-actions">
              <Button className="button" type="button" onClick={handleCopy} disabled={!isNoticeReady}>
                {copyLabel}
              </Button>
              <Button className="button button-secondary" type="button" onClick={handleRepeatNotice} disabled={!isNoticeReady}>
                {repeatLabel}
              </Button>
              <Button className="button button-secondary" type="button" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
          <p className="helper" role="status" aria-live="polite">
            {noticeStatusMessage}
          </p>
          <div className={`notice-status ${isNoticeReady ? "ready" : "needs"}`}>
            <p className="notice-status-title">{noticeReadiness.title}</p>
            <p className="helper">{noticeReadiness.detail}</p>
            {missingBasics.length > 0 && (
              <ul className="quick-list">
                {missingBasics.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {!isNoticeReady && (
              <Button className="button button-secondary" type="button" onClick={() => setCurrentStep(1)}>
                Go to step 1
              </Button>
            )}
          </div>
          <div className="summary-header">
            <h3>Notice summary</h3>
            <p className="helper">Check the key facts before you share.</p>
          </div>
          <div className="summary-grid">
            {summaryItems.map((item) => (
              <div key={item.label} className="summary-card">
                <p className="summary-label">{item.label}</p>
                <p className="summary-value">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="helper">Preview the message before you share it.</p>
          <p className="helper">Privacy reminder: do not include names, unit numbers, or personal details.</p>
          <div className="notice-preview">
            <div className="notice-preview-header">
              <div>
                <p className="notice-preview-title">Notice message</p>
                <p className="helper">Copy and send this text.</p>
              </div>
              <div className="notice-preview-tags">
                <span className="notice-tag">{selectedIssue?.label || "Issue"}</span>
                <span className="notice-tag">{stageLabel}</span>
                <span className="notice-tag">{noticeLanguageLabel}</span>
              </div>
            </div>
            <pre className="output output-notice">{noticeText}</pre>
          </div>
          <div className="export-block">
            <div className="export-header">
              <div>
                <h3>{selectedAudience.label} export</h3>
                <p className="helper">Choose who you are exporting for. The fields adjust automatically.</p>
              </div>
              <div className="export-actions">
                <Button className="button button-secondary" type="button" onClick={handleSummaryCopy}>
                  {summaryCopyLabel}
                </Button>
                <Button className="button button-secondary" type="button" onClick={handleSummaryDownload}>
                  Download .txt
                </Button>
              </div>
            </div>
            <p className="helper" role="status" aria-live="polite">
              {exportStatusMessage}
            </p>
            <div className="export-status">
              <label>
                Issue status
                <Select.Root value={formState.exportStatus} onValueChange={updateSelect("exportStatus")} required>
                  <Select.Trigger className="select-trigger" aria-label="Issue status">
                    <Select.Value placeholder="Select status" />
                    <Select.Icon className="select-icon">
                      <span aria-hidden="true">▾</span>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner className="select-positioner">
                      <Select.Popup className="select-popup">
                        <Select.List className="select-list">
                          {exportStatusOptions.map((option) => (
                            <Select.Item key={option.id} value={option.id} className="select-item">
                              <Select.ItemText>
                                {option.label} — {option.description}
                              </Select.ItemText>
                              <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
              </label>
            </div>
            <RadioGroup.Root
              className="export-presets"
              aria-label="Export audience"
              value={exportAudience}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  setExportAudience(value as ExportAudience);
                }
              }}
            >
              {exportAudienceOptions.map((option) => (
                <RadioGroup.Item
                  key={option.id}
                  value={option.id}
                  render={<div />}
                  className={`preset-card ${exportAudience === option.id ? "active" : ""}`}
                >
                  <span className="preset-radio" aria-hidden="true">
                    <span className="preset-radio-outer">
                      <span className="preset-radio-indicator" />
                    </span>
                  </span>
                  <div>
                    <p className="preset-title">{option.label}</p>
                    <p className="helper">{option.description}</p>
                  </div>
                </RadioGroup.Item>
              ))}
            </RadioGroup.Root>
            <pre className="output output-summary">{exportSummary}</pre>
            <div className="submission-block">
              <div>
                <h3>Save to the shared ledger</h3>
                <p className="helper">This saves a short summary. It does not save personal details.</p>
                {!buildingKey && (
                  <p className="helper">Add your building key to the URL before saving.</p>
                )}
                {!formState.building || !formState.issue ? (
                  <p className="helper">Choose a building and issue to enable saving.</p>
                ) : null}
              </div>
              <div className="submission-actions">
                <Button
                  className="button button-secondary"
                  type="button"
                  onClick={handleLedgerSave}
                  disabled={!canSaveLedger || saveStatus === "saving"}
                >
                  {saveLabel}
                </Button>
                {submissionUrl && (
                  <Button className="button button-secondary" type="button" onClick={handleCopyLink}>
                    {linkCopyLabel}
                  </Button>
                )}
              </div>
              {saveStatus === "saved" && submissionUrl && (
                <p className="submission-note" role="status" aria-live="polite">
                  Saved. Your permalink: <a href={submissionUrl}>{submissionUrl}</a>
                </p>
              )}
              {saveStatus === "error" && (
                <p className="submission-error" role="alert">
                  {saveError || "We could not save the ledger entry."}
                </p>
              )}
              {linkStatusMessage && (
                <p className="helper" role="status" aria-live="polite">
                  {linkStatusMessage}
                </p>
              )}
              {(detailSummaryItems.length > 0 || savedMetaItems.length > 0) && (
                <div className="submission-details">
                  <p className="helper">Details saved:</p>
                  <ul>
                    {savedMetaItems.map((item) => (
                      <li key={item.label}>
                        <strong>{item.label}:</strong> {item.value}
                      </li>
                    ))}
                    {detailSummaryItems.map((item) => (
                      <li key={item.label}>
                        <strong>{item.label}:</strong> {item.value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="plain-meaning">
            <Button
              className="button button-secondary"
              type="button"
              onClick={() => setPlainMeaningVisible((prev) => !prev)}
            >
              {plainMeaningVisible ? "Hide plain meaning" : "Show plain meaning"}
            </Button>
            {plainMeaningVisible && (
              <ul className="meaning-list">
                {meaningItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </aside>
        <aside className="panel contact-panel">
          <h2>Continuum contacts</h2>
          <p className="helper">Use these contacts if your building is listed under Continuum.</p>
          <p><strong>Maintenance text line:</strong> (773) 708-2321</p>
          <p><strong>Landlord line:</strong> +1 (773) 678-7636</p>
          <p><strong>Rent email:</strong> continuumbrokers@yahoo.com</p>
          <p className="helper">Use text for urgent safety issues. Email for rent receipts.</p>
          <p className="helper">If your building has different contacts, use the waitlist below.</p>
        </aside>
      </main>

      <WaitlistPanel />

      <footer className="site-footer">
        <p>Safety first: evidence is optional. Public views hide personal details.</p>
      </footer>
    </div>
  );
};

export default NoticeBuilder;
