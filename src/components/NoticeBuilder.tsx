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
import { detailCharacterLimit } from "../lib/submissions";
import useTimedCallbacks from "../hooks/useTimedCallbacks";
import { addDays, formatCalendarDate, formatDate, formatTimelineDate, getCurrentTime } from "../lib/dateUtils";
import { fillTemplate, formatIssueLabel } from "../lib/noticeUtils";
import {
  detailWarningThreshold,
  evidenceSafetyChecklist,
  exportAudienceOptions,
  exportStatusOptions,
  factualTagOptions,
  freeTextSafetyNote,
  stageOptions,
  steps,
} from "./noticeBuilder/constants";
import { issueIcons } from "./noticeBuilder/issueIcons";
import type { Stage } from "./noticeBuilder/types";

const initialState = {
  building: "",
  zone: "",
  issue: "",
  stage: "A",
  exportStatus: "open",
  language: "en",
  portfolio: "continuum",
  simpleEnglish: true,
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
};

type FormState = typeof initialState;
type QuickStartPreset = "first_notice" | "follow_up" | "final_reminder";

const detailEntries = Object.entries(fieldDefinitions);

const RadioGroup = {
  Root: BaseRadioGroup,
  Item: Radio.Root,
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
  const [noticeStatusMessage, setNoticeStatusMessage] = useState("");
  const [exportStatusMessage, setExportStatusMessage] = useState("");
  const [linkStatusMessage, setLinkStatusMessage] = useState("");
  const { scheduleTimeout } = useTimedCallbacks();
  const stepProgress = Math.round((currentStep / steps.length) * 100);
  const currentStepInfo = steps[currentStep - 1];
  const nextStepInfo = steps[currentStep] || null;
  const progressPillLabel = stepProgress < 100 ? `${stepProgress}%` : "Done";

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
  const stepsLocked = !isStep1Complete;
  const canShowAfterBasics = isStep1Complete;
  const isNoticeReady = missingBasics.length === 0;
  const noticeReadinessTitle = isNoticeReady ? "Notice ready" : "Finish the basics";
  const canSaveLedger = Boolean(formState.building && formState.issue && buildingKey);
  const canFastTrack = Boolean(formState.building && formState.issue);

  const quickStartSummary: Record<QuickStartPreset, { title: string; description: string }> = {
    first_notice: {
      title: "First notice",
      description: "New issue. Fast default.",
    },
    follow_up: {
      title: "Follow-up",
      description: "After first notice.",
    },
    final_reminder: {
      title: "Final reminder",
      description: "After follow-up.",
    },
  };

  const renderDetailField = (fieldKey: keyof typeof fieldDefinitions) => {
    const field = fieldDefinitions[fieldKey];
    if (!field) {
      return null;
    }
    const isAttachmentField = fieldKey === "attachment";
    const fieldValue = String(formState[fieldKey as keyof FormState] ?? "");
    const trimmedLength = fieldValue.trim().length;
    const isTextField = !field.type;
    const tags = isTextField ? factualTagOptions[fieldKey] : undefined;
    const showLimitWarning = isTextField && trimmedLength >= detailWarningThreshold;
    const limitText = isTextField
      ? `Limit: ${detailCharacterLimit} characters${trimmedLength > 0 ? ` (${trimmedLength}/${detailCharacterLimit})` : "."}`
      : "";
    const helperText = isTextField ? `${limitText} ${freeTextSafetyNote}` : "";
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
        {tags && (
          <div className="fact-tags" aria-label={`${field.label} quick facts`}>
            <p className="helper">Quick facts:</p>
            <div className="fact-tag-row">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className="fact-tag"
                  type="button"
                  onClick={() => handleTagClick(fieldKey as keyof FormState, tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
        {isTextField && (
          <p className={`helper${showLimitWarning ? " helper-warning" : ""}`} id={helperId}>
            {helperText}
            {trimmedLength > detailCharacterLimit && " Extra text is removed when saving."}
          </p>
        )}
      </label>
    );
  };

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

  const handleTagClick = (fieldKey: keyof FormState, tag: string) => {
    setFormState((prev) => {
      const current = String(prev[fieldKey] ?? "").trim();
      if (!current) {
        return { ...prev, [fieldKey]: tag };
      }
      if (current.toLowerCase().includes(tag.toLowerCase())) {
        return prev;
      }
      return { ...prev, [fieldKey]: `${current}, ${tag}` };
    });
  };

  const handleFastTrackToPreview = () => {
    if (!formState.building || !formState.issue) {
      setNoticeStatusMessage("Choose building and issue first.");
      scheduleTimeout("notice-status", () => setNoticeStatusMessage(""), 2200);
      return;
    }

    const today = new Date();
    const formattedToday = formatDate(today);
    setFormState((prev) => ({
      ...prev,
      stage: prev.stage || "A",
      simpleEnglish: true,
      autoDates: true,
      today: prev.today || formattedToday,
      startDate: prev.startDate || formattedToday,
      time: prev.time || getCurrentTime(today),
    }));
    setCurrentStep(4);
    setNoticeStatusMessage("Preview ready. Review and copy.");
    scheduleTimeout("notice-status", () => setNoticeStatusMessage(""), 2200);
  };

  const handleQuickStart = (preset: QuickStartPreset) => {
    const today = new Date();
    const formattedToday = formatDate(today);
    const followUpDate = formatDate(addDays(today, -3));
    const finalReminderDate = formatDate(addDays(today, -6));

    setFormState((prev) => {
      if (preset === "first_notice") {
        return {
          ...prev,
          stage: "A",
          simpleEnglish: true,
          autoDates: true,
          today: formattedToday,
          startDate: prev.startDate || formattedToday,
          firstMessageDate: "",
        };
      }

      if (preset === "follow_up") {
        return {
          ...prev,
          stage: "B",
          simpleEnglish: true,
          autoDates: true,
          today: formattedToday,
          startDate: prev.startDate || followUpDate,
          firstMessageDate: prev.firstMessageDate || followUpDate,
        };
      }

      return {
        ...prev,
        stage: "C",
        simpleEnglish: true,
        autoDates: true,
        today: formattedToday,
        startDate: prev.startDate || finalReminderDate,
        firstMessageDate: prev.firstMessageDate || finalReminderDate,
      };
    });

    setCurrentStep((prev) => (prev < 2 ? 2 : prev));
    const presetTitle = quickStartSummary[preset].title;
    setNoticeStatusMessage(`${presetTitle} mode is ready. Continue with basics.`);
    scheduleTimeout("notice-status", () => setNoticeStatusMessage(""), 2200);
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
    scheduleTimeout("copy-label", () => setCopyLabel("Copy text"), 1500);
    scheduleTimeout("notice-status", () => setNoticeStatusMessage(""), 2000);
  };

  const handleSummaryCopy = async () => {
    await navigator.clipboard.writeText(exportSummary);
    setSummaryCopyLabel("Copied!");
    setExportStatusMessage("Summary copied.");
    scheduleTimeout("summary-copy-label", () => setSummaryCopyLabel("Copy summary"), 1500);
    scheduleTimeout("export-status", () => setExportStatusMessage(""), 2000);
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
    scheduleTimeout("export-status", () => setExportStatusMessage(""), 2000);
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
    scheduleTimeout("link-copy-label", () => setLinkCopyLabel("Copy link"), 1500);
    scheduleTimeout("link-status", () => setLinkStatusMessage(""), 2000);
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
    scheduleTimeout("repeat-label", () => setRepeatLabel("Repeat with today's date"), 1600);
    scheduleTimeout("notice-status", () => setNoticeStatusMessage(""), 2000);
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

  const guidedAction = useMemo(() => {
    if (!formState.building) {
      return { label: "Choose building", step: 1 };
    }
    if (!formState.issue) {
      return { label: "Choose issue", step: 1 };
    }
    if (currentStep < steps.length) {
      return { label: `Step ${currentStep + 1}`, step: currentStep + 1 };
    }
    return { label: "Review + copy", step: 4 };
  }, [currentStep, formState.building, formState.issue]);

  const basicsChecklist = [
    { label: "Building selected", done: Boolean(formState.building) },
    { label: "Issue selected", done: Boolean(formState.issue) },
    { label: "Simple English on", done: formState.simpleEnglish },
  ];

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="hero">
        <div className="hero-main">
          <p className="eyebrow">Building Ledger</p>
          <h1>Tenant Notice Builder</h1>
          <p className="tagline">Make a notice fast.</p>
          <div className="hero-actions">
            <a className="button hero-button" href="#builder">
              Start
            </a>
            <a className="button button-secondary hero-button" href="#preview">
              Preview
            </a>
            <a className="button button-secondary hero-button" href="#record">
              Next steps
            </a>
          </div>
          <div className="tag-row">
            <span>No names saved</span>
            <span>Short facts only</span>
            <span>Evidence stays private</span>
            <span>Share with neighbors only</span>
          </div>
        </div>
        <div className="hero-steps" aria-label="Quick steps">
          <div className="hero-step-card">
            <p className="hero-step-title">1. Basics</p>
            <p className="helper">Pick building and issue.</p>
          </div>
          <div className="hero-step-card">
            <p className="hero-step-title">2. Dates</p>
            <p className="helper">Check dates and language.</p>
          </div>
          <div className="hero-step-card">
            <p className="hero-step-title">3. Add facts</p>
            <p className="helper">Optional short facts.</p>
          </div>
          <div className="hero-step-card">
            <p className="hero-step-title">4. Review</p>
            <p className="helper">Preview, save, and export.</p>
          </div>
        </div>
      </header>

      <main id="main">
        <div className="layout">
          <section className="panel" id="builder">
            <div className="step-header">
              <h2>Build your notice</h2>
              <div className="step-meta">
                <div className="step-progress">
                  <div className="step-progress-row">
                    <p className="step-progress-label">Step {currentStep} of {steps.length}</p>
                    <span className="step-progress-pill">{progressPillLabel}</span>
                  </div>
                  <div
                    className="step-progress-track"
                    role="progressbar"
                    aria-valuenow={stepProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Step progress"
                  >
                    <span className="step-progress-bar" style={{ width: `${stepProgress}%` }} />
                  </div>
                </div>
                <div className="step-privacy">
                  <p className="helper privacy-reminder">
                    No names or unit numbers. Use general areas.
                  </p>
                  <p className="helper step-now">Now: {currentStepInfo.label}</p>
                </div>
              </div>
            </div>
            <Tabs.Root
              value={String(currentStep)}
              onValueChange={(value) => {
                if (value) {
                  const nextStep = Number(value);
                  if (stepsLocked && nextStep > 1) {
                    return;
                  }
                  setCurrentStep(nextStep);
                }
              }}
            >
              <Tabs.List className="step-nav">
                {steps.map((step) => {
                  const isLocked = stepsLocked && step.id > 1;
                  return (
                    <Tabs.Tab
                      key={step.id}
                      value={String(step.id)}
                      disabled={isLocked}
                      className={`step-button ${currentStep === step.id ? "active" : ""}${isLocked ? " disabled" : ""}`}
                      aria-current={currentStep === step.id ? "step" : undefined}
                    >
                      <span className="step-title">{step.title}</span>
                      <span className="step-label">{step.label}</span>
                      <span className="step-requirement">{step.requirement}</span>
                    </Tabs.Tab>
                  );
                })}
              </Tabs.List>
              {stepsLocked && (
                <p className="helper">Finish step 1 to continue.</p>
              )}

              <form className="form-grid">
                <Tabs.Panel value="1">
                  <div className="form-section">
                    <div className="form-section-header">
                      <h3>Building basics</h3>
                      <p className="helper">Quick start</p>
                    </div>
                    <div className="quick-start-grid" aria-label="Quick start options">
                      {(Object.keys(quickStartSummary) as QuickStartPreset[]).map((preset) => {
                        const option = quickStartSummary[preset];
                        return (
                          <button
                            key={preset}
                            type="button"
                            className="quick-start-card"
                            onClick={() => handleQuickStart(preset)}
                          >
                            <span className="quick-start-title">{option.title}</span>
                            <span className="quick-start-description">{option.description}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="guided-action" role="status" aria-live="polite">
                      <p className="guided-action-label">Next: {guidedAction.label}</p>
                      <div className="guided-action-buttons">
                        <Button
                          className="button button-secondary"
                          type="button"
                          onClick={() => setCurrentStep(guidedAction.step)}
                        >
                          Go now
                        </Button>
                        <Button
                          className="button"
                          type="button"
                          onClick={handleFastTrackToPreview}
                          disabled={!canFastTrack}
                        >
                          Finish setup fast
                        </Button>
                      </div>
                    </div>
                    <div className="basics-checklist" aria-label="Basics checklist">
                      {basicsChecklist.map((item) => (
                        <p key={item.label} className={`check-item ${item.done ? "done" : ""}`}>
                          {item.done ? "✓" : "○"} {item.label}
                        </p>
                      ))}
                    </div>
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

                  </div>

                  <div className="form-section">
                    <div className="form-section-header">
                      <h3>Location and stage</h3>
                    </div>
                    <label>
                      Location zone (optional)
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
                      <p className="helper">General area only. No unit numbers.</p>
                    </label>

                    <fieldset className="stage-selector">
                      <legend>Notice stage</legend>
                      <RadioGroup.Root
                        className="stage-options"
                        aria-label="Notice stage"
                        value={formState.stage}
                        onValueChange={(value) => {
                          if (typeof value === "string") {
                            setFormState((prev) => ({ ...prev, stage: value as Stage }));
                          }
                        }}
                      >
                        {stageOptions.map((option) => (
                          <RadioGroup.Item
                            key={option.id}
                            value={option.id}
                            render={<div />}
                            className={`preset-card ${formState.stage === option.id ? "active" : ""}`}
                          >
                            <span className="preset-radio" aria-hidden="true">
                              <span className="preset-radio-outer">
                                <span className="preset-radio-indicator" />
                              </span>
                            </span>
                            <div>
                              <p className="preset-title">{option.label}</p>
                            </div>
                          </RadioGroup.Item>
                        ))}
                      </RadioGroup.Root>
                    </fieldset>
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="2">
                  <div className="form-section">
                    <div className="form-section-header">
                      <h3>Language and style</h3>
                      <p className="helper">Short language setup.</p>
                    </div>
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
                  </div>

                  <div className="form-section">
                    <div className="form-section-header">
                      <h3>Key dates</h3>
                      <p className="helper">Check dates.</p>
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
                        First message date (for follow-ups)
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
                  </div>

                </Tabs.Panel>

                <Tabs.Panel value="3">
                  <p className="helper">Optional facts and evidence.</p>
                  {issueFields.length === 0 && (
                    <p className="helper">Select an issue to see detail fields.</p>
                  )}
                  {issueFields.length > 0 && (
                    <>
                      <div className="form-section">
                        <div className="form-section-header">
                          <h3>Issue facts</h3>
                          <p className="helper">Optional. Keep notes short.</p>
                        </div>
                        {issueFields.filter((fieldKey) => fieldKey !== "attachment").length > 0 ? (
                          issueFields.filter((fieldKey) => fieldKey !== "attachment").map((fieldKey) =>
                            renderDetailField(fieldKey as keyof typeof fieldDefinitions)
                          )
                        ) : (
                          <p className="helper">No extra facts are needed for this issue.</p>
                        )}
                      </div>
                      {issueFields.filter((fieldKey) => fieldKey === "attachment").length > 0 && (
                        <div className="form-section">
                          <div className="form-section-header">
                            <h3>Evidence note</h3>
                          </div>
                          {issueFields
                            .filter((fieldKey) => fieldKey === "attachment")
                            .map((fieldKey) => renderDetailField(fieldKey as keyof typeof fieldDefinitions))}
                        </div>
                      )}
                    </>
                  )}
                </Tabs.Panel>

                <Tabs.Panel value="4">
                  <p className="helper">
                    Review the preview. Copy and save. Dates and repeats help.
                  </p>
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
          </section>
          <aside className="panel panel-highlight preview-panel" id="preview">
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
          <section className="preview-section">
            <div className={`notice-status ${isNoticeReady ? "ready" : "needs"}`}>
              <p className="notice-status-title">{noticeReadinessTitle}</p>
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
          </section>
          <section className="preview-section">
            <div className="summary-header">
              <h3>Notice summary</h3>
            </div>
            <div className="summary-grid">
              {summaryItems.map((item) => (
                <div key={item.label} className="summary-card">
                  <p className="summary-label">{item.label}</p>
                  <p className="summary-value">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="helper">Privacy reminder: no names, unit numbers, or personal details.</p>
          </section>
          <section className="preview-section">
            <div className="notice-preview">
              <div className="notice-preview-header">
                <div>
                  <p className="notice-preview-title">Notice message</p>
                </div>
                <div className="notice-preview-tags">
                  <span className="notice-tag">{selectedIssue?.label || "Issue"}</span>
                  <span className="notice-tag">{stageLabel}</span>
                  <span className="notice-tag">{noticeLanguageLabel}</span>
                </div>
              </div>
              <pre className="output output-notice">{noticeText}</pre>
            </div>
          </section>
          <section className="preview-section">
            <div className="export-block">
              {!canShowAfterBasics ? (
                <p className="helper">Finish step 1 for save/export.</p>
              ) : (
                <>
                  <div className="export-header">
                    <div>
                      <h3>{selectedAudience.label} export</h3>
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
                                      {option.label}
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
                        </div>
                      </RadioGroup.Item>
                    ))}
                  </RadioGroup.Root>
                  <pre className="output output-summary">{exportSummary}</pre>
                  <div className="submission-block">
                    <div>
                      <h3>Save to the shared ledger</h3>
                      {!buildingKey && (
                        <p className="helper">Add your building key to the URL to save. Your organizer provides it.</p>
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
                        <p className="helper">Saved details:</p>
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
                </>
              )}
            </div>
          </section>
          <section className="preview-section">
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
          </section>
          </aside>
        </div>

        <section className="panel panel-highlight record-panel" id="record">
          <div>
            <h2>Record and next steps</h2>
            <p className="helper">Use this after you send the notice.</p>
          </div>
          {!canShowAfterBasics ? (
            <p className="helper">Finish step 1 for this section.</p>
          ) : (
            <>
              <div>
                <h3>Issue timeline</h3>
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
                  <p className="helper">Add a date above to show the timeline.</p>
                )}
              </div>

              <div>
                <h3>What usually happens next</h3>
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
                          <p className="helper">
                            {step.unlocked
                              ? `Unlocked at ${daysOpen} days open.`
                              : `Unlocks after ${step.unlockDay} days open.`}
                          </p>
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
                          Add Google Calendar reminder
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3>Community impact</h3>
                <div className="impact">
                  <div className="impact-summary">
                    <p className="impact-count">{impactCount}</p>
                    <div>
                      <p className="impact-label">Total reports</p>
                      <p className="impact-hint">Reports start at 1. Use “Me too” to add yours.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3>Help and sources</h3>
                <p className="helper">Information only. Not legal advice.</p>
                {issueGuidance && (
                  <details className="helper-card">
                    <summary>311 call info</summary>
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
              </div>
            </>
          )}
        </section>
      </main>

      <WaitlistPanel />

      <footer className="site-footer">
        <p>Safety first: evidence is optional. Public views hide personal details.</p>
      </footer>
    </div>
  );
};

export default NoticeBuilder;
