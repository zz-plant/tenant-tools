import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  Radio,
  RadioGroup as BaseRadioGroup,
  Switch,
  Tabs,
} from "./ui";
import {
  fieldDefinitions,
  issueFieldMap,
  issueOptions,
  meaningMap,
  stages,
  zoneOptions,
} from "../data/noticeData";
import { defaultBuildingOptions, type BuildingOption } from "../data/buildings";
import { portfolioOptions } from "../data/portfolioOptions";
import { getNoticeMilestone, heatMinimumLines, heatSeasonLabel, isInHeatSeason } from "../data/rules";
import { buildExportSummary, type ExportAudience } from "../lib/exportSummary";
import useTimedCallbacks from "../hooks/useTimedCallbacks";
import { formatDate, formatTimelineDate, getCurrentTime } from "../lib/dateUtils";
import { formatIssueLabel, getVisibleUnlockableSteps } from "../lib/noticeUtils";
import { detectSensitiveContent } from "../lib/validation";
import {
  rentCreditIssues,
  evidenceSafetySummary,
  exportAudienceOptions,
  exportStatusOptions,
  stageOptions,
  steps,
} from "./noticeBuilder/constants";
import { issueIcons } from "./noticeBuilder/issueIcons";
import DetailField from "./noticeBuilder/DetailField";
import RecordPanel from "./noticeBuilder/RecordPanel";
import SelectField from "./noticeBuilder/SelectField";
import StepProgressHeader from "./noticeBuilder/StepProgressHeader";
import {
  buildGuidanceScript,
  buildNextSteps,
  buildNoticeText,
  leaseQuoteLimit,
  chooseNoticeTemplate,
  collectIssueDetails,
  collectRuleCards,
  computeDaysOpen,
  createInitialFormState,
  getIssueGuidance,
  getWithheldNoticeNote,
  type FormState,
  type IssueFieldKey,
} from "./noticeBuilder/logic";
import { getFirstWrittenNoticeDate, getSubmissionTimelineEntries } from "../lib/submissionTimeline";
import type { Stage } from "./noticeBuilder/types";
import type { BuilderNoticeContacts } from "../lib/noticeContacts";


const detailEntries = Object.entries(fieldDefinitions);
/** Timeline labels for the notice being written. Before it is saved, they are a preview. */
const sentLabels = new Set(["Notice sent", "Follow-up sent", "Final reminder sent"]);

const languageOptions = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "hi", label: "हिंदी" },
  { id: "pl", label: "Polski" },
] as const;

const ResidentSessionNote = () => (
  <p className="helper">
    Your resident key is saved on this device. <a href="/?forget=1">Forget key on this device</a>
  </p>
);

/** Shown when the chosen language has no reviewed translation of this notice (AGENTS.md §14). */
const WithheldNoticeNote = ({ note }: { note: { text: string; lang: string } | null }) =>
  note ? (
    <p className="helper helper-warning" role="status" lang={note.lang}>
      {note.text}
    </p>
  ) : null;

const RadioGroup = {
  Root: BaseRadioGroup,
  Item: Radio.Root,
};


type NoticeBuilderProps = {
  buildingOptions?: BuildingOption[];
  /** Building ids the resident key cookie on this device unlocks. `"*"` means every building. */
  residentBuildings?: string[];
  /** Saved notice contacts, only for buildings this device's key unlocks. */
  noticeContacts?: Record<string, BuilderNoticeContacts>;
};

const NoticeBuilder = ({
  buildingOptions = defaultBuildingOptions,
  residentBuildings = [],
  noticeContacts = {},
}: NoticeBuilderProps) => {
  const defaultBuilding = useMemo(() => {
    if (residentBuildings.includes("2400 W Wabansia")) return "2400 W Wabansia";
    if (buildingOptions.some((b) => b.id === "2400 W Wabansia")) return "2400 W Wabansia";
    return buildingOptions[0]?.id || "";
  }, [buildingOptions, residentBuildings]);

  const [formState, setFormState] = useState<FormState>(() =>
    createInitialFormState(new Date(), defaultBuilding)
  );
  const buildingSelectOptions = useMemo(
    () => buildingOptions.map((building) => ({ id: building.id, label: building.id })),
    [buildingOptions]
  );
  const [buildingKey, setBuildingKey] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [plainMeaningVisible, setPlainMeaningVisible] = useState(false);
  const [impactCount] = useState(1);
  const [copyLabel, setCopyLabel] = useState("Copy notice text");
  const [summaryCopyLabel, setSummaryCopyLabel] = useState("Copy inspector summary");
  const [saveLabel, setSaveLabel] = useState("Save record");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [saveWarnings, setSaveWarnings] = useState<string[]>([]);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [linkCopyLabel, setLinkCopyLabel] = useState("Copy resident link");
  const [repeatLabel, setRepeatLabel] = useState("Copy again with today's date");
  const [exportAudience, setExportAudience] = useState<ExportAudience>("inspector");
  const [noticeStatusMessage, setNoticeStatusMessage] = useState("");
  const [exportStatusMessage, setExportStatusMessage] = useState("");
  const [linkStatusMessage, setLinkStatusMessage] = useState("");
  const [shareChecks, setShareChecks] = useState({ names: false, units: false, contact: false });
  const [showOptionalSetup, setShowOptionalSetup] = useState(false);
  // After the building and problem are chosen, they fold to one line so the send buttons are
  // near the top. A keyboard choice does not fold the grid: arrow keys change the choice, and
  // folding would take focus away. "Done" folds it.
  const [foldBasics, setFoldBasics] = useState(false);
  // Copy, Email, and Text also save the notice, so residents do not need a separate save step.
  const [addToLedger, setAddToLedger] = useState(true);
  // Set when the builder was opened from a saved record ("Send a follow-up"). Saving then adds a
  // dated fact to that record instead of creating a second record for the same problem.
  const [recordContext, setRecordContext] = useState<{
    id: string;
    url: string;
    startDate: string;
    /** Highest notice step unlocked for this record, from the server. */
    allowedStage: Stage;
    unlockDate: string;
  } | null>(null);
  const [recordNote, setRecordNote] = useState("");
  // What a new record saved. There is no edit path for records, so later changes are not saved:
  // the builder says so instead of showing "Saved" for details the ledger does not have.
  const [savedFingerprint, setSavedFingerprint] = useState("");
  // After a choice, bring the next question into view so residents do not hunt for it on a phone.
  const [scrollTarget, setScrollTarget] = useState("");
  useEffect(() => {
    if (!scrollTarget || typeof window === "undefined") {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      document.querySelector(scrollTarget)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      setScrollTarget("");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [scrollTarget]);
  // "Change" and "Done" swap the building and problem between one line and the full list. Focus
  // moves with them, so keyboard and screen reader users do not lose their place.
  const [focusTarget, setFocusTarget] = useState("");
  useEffect(() => {
    if (!focusTarget || typeof window === "undefined") {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(focusTarget)?.focus({ preventScroll: true });
      setFocusTarget("");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusTarget]);
  const { scheduleTimeout } = useTimedCallbacks();
  const stepProgress = Math.round((currentStep / steps.length) * 100);
  const currentStepInfo = steps[currentStep - 1];

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
  const basicsFolded = isStep1Complete && foldBasics;
  // A cleared form starts open again, so a later keyboard choice does not fold the list.
  useEffect(() => {
    if (!isStep1Complete) {
      setFoldBasics(false);
    }
  }, [isStep1Complete]);
  const sendTo = noticeContacts[formState.building] ?? null;
  const showLockedStepPlaceholder = !isStep1Complete;
  const stepsLocked = !isStep1Complete;
  const visibleBuilderSteps = useMemo(
    () => (stepsLocked ? steps.filter((step) => step.id <= 2) : steps),
    [stepsLocked]
  );
  const canShowAfterBasics = isStep1Complete;
  const isNoticeReady = missingBasics.length === 0;
  const noticeReadinessTitle = isNoticeReady ? "Notice ready" : "Finish the basics";
  const copyDisabledReason = !isNoticeReady
    ? `Copy unlocks after: ${missingBasics.join(" and ")}.`
    : "";
  const normalizedBuildingKey = buildingKey.trim();
  // The middleware stores the key from a resident link in an httpOnly cookie, and same-origin
  // fetches send it. Residents who opened a key link do not need to paste the key again.
  const hasResidentSession = Boolean(
    formState.building && (residentBuildings.includes("*") || residentBuildings.includes(formState.building))
  );
  const hasSaveAccess = Boolean(normalizedBuildingKey) || hasResidentSession;
  // In record mode a follow-up or final reminder is added to the saved record as a dated fact, but
  // only for a step that is unlocked for that record. A later step shows when it unlocks instead.
  const stageRank: Record<string, number> = { A: 0, B: 1, C: 2 };
  const stageIsUnlocked = Boolean(
    recordContext && stageRank[formState.stage] <= stageRank[recordContext.allowedStage]
  );
  const recordFactType =
    recordContext && stageIsUnlocked && (formState.stage === "B" || formState.stage === "C")
      ? formState.stage === "C"
        ? "final_notice_sent"
        : "follow_up_sent"
      : null;
  const recordLockNote =
    recordContext && !recordFactType && recordContext.unlockDate
      ? `${recordContext.allowedStage === "A" ? "A follow-up" : "The final reminder"} unlocks on ${formatTimelineDate(recordContext.unlockDate)}.`
      : "";
  const recordFactLabel = recordFactType === "final_notice_sent" ? "Final reminder sent" : "Follow-up notice sent";
  const canSaveLedger = Boolean(
    formState.building && formState.issue && hasSaveAccess && (!recordContext || recordFactType)
  );
  const saveDisabledMessage = !formState.building || !formState.issue
    ? "Choose a building and issue to enable saving."
    : !hasSaveAccess
      ? "Add the building key to save."
      : "";
  const canCopyPermalink = shareChecks.names && shareChecks.units && shareChecks.contact;

  const renderDetailField = (fieldKey: IssueFieldKey) => (
    <DetailField
      key={fieldKey}
      fieldKey={fieldKey}
      value={String(formState[fieldKey as keyof FormState] ?? "")}
      onChange={(value) => setFormState((prev) => ({ ...prev, [fieldKey]: value }))}
      onTagClick={(tag) => handleTagClick(fieldKey as keyof FormState, tag)}
    />
  );

  const updateField =
    (key: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value, type } = event.currentTarget;
      const target = event.currentTarget;
      const checkedValue = target instanceof HTMLInputElement && type === "checkbox" ? target.checked : null;
      setFormState((prev) => ({
        ...prev,
        [key]: checkedValue ?? value,
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


  const selectedIssue = issueOptions.find((option) => option.id === formState.issue);
  const issueFields: readonly IssueFieldKey[] =
    issueFieldMap[formState.issue as keyof typeof issueFieldMap] || [];
  const ledgerFingerprint = JSON.stringify([
    formState.building,
    formState.issue,
    formState.stage,
    formState.startDate,
    formState.zone,
    formState.firstMessageDate,
    formState.ticketDate,
    formState.ticketNumber,
    collectIssueDetails(formState, issueFields),
  ]);
  const changedSinceSave =
    saveStatus === "saved" && !recordContext && Boolean(savedFingerprint) && savedFingerprint !== ledgerFingerprint;
  const stageLabel = stages[formState.stage as Stage] || stages.A;

  const selectedZone = zoneOptions.find((option) => option.id === formState.zone);
  const selectedAudience =
    exportAudienceOptions.find((option) => option.id === exportAudience) || exportAudienceOptions[0];
  const selectedExportStatus =
    exportStatusOptions.find((option) => option.id === formState.exportStatus) || exportStatusOptions[0];
  const selectedPortfolio = portfolioOptions.find((option) => option.id === formState.portfolio);


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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const recordId = params.get("record") ?? "";
    if (/^[A-Za-z0-9-]{8,80}$/.test(recordId)) {
      fetch(`/api/submissions/${encodeURIComponent(recordId)}`, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
        .then((record) => {
          if (!record || typeof record !== "object" || typeof record.building !== "string") {
            throw new Error("invalid record");
          }
          // The server works out the next step from the record's dates and on-time notices.
          const next = record.nextNotice as { stage?: unknown; unlockDate?: unknown } | undefined;
          const stage: Stage = next?.stage === "B" || next?.stage === "C" ? next.stage : "A";
          const unlockDate = typeof next?.unlockDate === "string" ? next.unlockDate : "";
          const details: Record<string, string> = {};
          const formFields = createInitialFormState(new Date());
          Object.entries((record.issueDetails ?? {}) as Record<string, unknown>).forEach(([key, value]) => {
            if (typeof value === "string" && key in formFields) {
              details[key] = value;
            }
          });
          setFormState((prev) => ({
            ...prev,
            ...details,
            building: buildingOptions.some((b) => b.id === record.building) ? record.building : prev.building,
            issue: issueOptions.some((opt) => opt.id === record.issue) ? record.issue : prev.issue,
            startDate: typeof record.startDate === "string" && record.startDate ? record.startDate : prev.startDate,
            zone: typeof record.zone === "string" ? record.zone : prev.zone,
            ticketDate: typeof record.ticketDate === "string" ? record.ticketDate : prev.ticketDate,
            ticketNumber: typeof record.ticketNumber === "string" ? record.ticketNumber : prev.ticketNumber,
            firstMessageDate: getFirstWrittenNoticeDate(record) || prev.firstMessageDate,
            stage,
          }));
          setRecordContext({
            id: recordId,
            url: `/submissions/${encodeURIComponent(recordId)}`,
            startDate: typeof record.startDate === "string" ? record.startDate : "",
            allowedStage: stage,
            unlockDate,
          });
          setSaveLabel("Add to the record");
          setFoldBasics(true);
          setScrollTarget(".quick-notice-banner");
        })
        .catch(() => {
          setRecordNote("We could not open the saved record. Saving here makes a new record.");
        });
      return;
    }
    const urlBuilding = params.get("building");
    const urlIssue = params.get("issue");
    if (urlBuilding || urlIssue) {
      setFormState((prev) => ({
        ...prev,
        building: urlBuilding && buildingOptions.some((b) => b.id === urlBuilding) ? urlBuilding : prev.building,
        issue: urlIssue && issueOptions.some((opt) => opt.id === urlIssue) ? urlIssue : prev.issue,
      }));
      if (urlIssue && issueOptions.some((opt) => opt.id === urlIssue)) {
        setFoldBasics(true);
      }
    }
  }, [buildingOptions]);

  const noticeText = useMemo(() => buildNoticeText(formState, selectedIssue), [formState, selectedIssue]);
  const noticeChoice = useMemo(
    () => (selectedIssue ? chooseNoticeTemplate(formState, selectedIssue) : null),
    [formState, selectedIssue]
  );
  const withheldNote = noticeChoice?.withheld ? getWithheldNoticeNote(formState.language) : null;

  const noticeSubject = useMemo(() => {
    const issueName = formatIssueLabel(selectedIssue?.label || "Maintenance Issue");
    const bldg = formState.building || "Apartment";
    return `Maintenance Notice: ${issueName} - ${bldg}`;
  }, [selectedIssue?.label, formState.building]);

  const noticeEmailHref = useMemo(() => {
    if (!noticeText) return "#";
    return `mailto:?subject=${encodeURIComponent(noticeSubject)}&body=${encodeURIComponent(noticeText)}`;
  }, [noticeSubject, noticeText]);

  const noticeSmsHref = useMemo(() => {
    if (!noticeText) return "#";
    return `sms:?&body=${encodeURIComponent(noticeText)}`;
  }, [noticeText]);

  const meaningItems = meaningMap[formState.stage as Stage] || meaningMap.A;

  const daysOpen = useMemo(
    () => computeDaysOpen(formState.startDate, formState.today),
    [formState.startDate, formState.today]
  );

  const nextSteps = useMemo(
    () =>
      buildNextSteps({
        startDate: formState.startDate,
        today: formState.today,
        building: formState.building,
        issueLabel: selectedIssue?.label,
      }),
    [formState.startDate, formState.today, formState.building, selectedIssue?.label]
  );

  const visibleNextSteps = useMemo(() => getVisibleUnlockableSteps(nextSteps), [nextSteps]);

  const exportSummary = useMemo(() => {
    const building = formState.building || "[ADDRESS]";
    const portfolioLabel = selectedPortfolio?.label || "Not listed";
    const issueLabel = selectedIssue?.label || "[ISSUE TYPE]";
    const zoneLabel = selectedZone?.label || "Not listed";
    const statusLabel = selectedExportStatus.label;

    const issueDetails = collectIssueDetails(formState, issueFields);
    const firstNoticeDate = getFirstWrittenNoticeDate({
      stage: formState.stage as Stage,
      reportDate: formState.today,
      firstMessageDate: formState.firstMessageDate,
    });

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
      firstNoticeDate: firstNoticeDate || undefined,
      noticeMilestone: getNoticeMilestone(formState.issue, firstNoticeDate),
    });
  }, [
    formState,
    impactCount,
    issueFields,
    daysOpen,
    selectedIssue?.label,
    stageLabel,
    exportAudience,
    selectedZone?.label,
    selectedPortfolio?.label,
    selectedExportStatus.label,
  ]);

  const handleCopy = async () => {
    if (!noticeText) {
      return;
    }
    await navigator.clipboard.writeText(noticeText);
    saveOnSend();
    setCopyLabel("Copied!");
    setNoticeStatusMessage("Notice copied.");
    scheduleTimeout("copy-label", () => setCopyLabel("Copy notice text"), 1500);
    scheduleTimeout("notice-status", () => setNoticeStatusMessage(""), 2000);
  };

  const handleSummaryCopy = async () => {
    await navigator.clipboard.writeText(exportSummary);
    setSummaryCopyLabel("Copied!");
    setExportStatusMessage("Summary copied.");
    scheduleTimeout("summary-copy-label", () => setSummaryCopyLabel("Copy inspector summary"), 1500);
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
      setSaveError("Select a building and issue before saving this record.");
      return;
    }
    if (!hasSaveAccess) {
      setSaveStatus("error");
      setSaveLabel("Save record");
      setSaveError("Add your building key before saving this record.");
      return;
    }

    if (recordContext) {
      if (!recordFactType) {
        setSaveStatus("error");
        setSaveError("Choose the follow-up or the final reminder to add it to the record.");
        return;
      }
      setSaveStatus("saving");
      setSaveError("");
      setSaveLabel("Saving...");
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (normalizedBuildingKey) {
          headers["x-building-key"] = normalizedBuildingKey;
        }
        const response = await fetch(`/api/submissions/${encodeURIComponent(recordContext.id)}/events`, {
          method: "POST",
          headers,
          // The Email and Text buttons switch to another app. keepalive lets the save finish.
          keepalive: true,
          body: JSON.stringify({ type: recordFactType, date: formState.today }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "We could not add this to the record.");
        }
        setSubmissionUrl(recordContext.url);
        setSaveStatus("saved");
        setSaveLabel("Added to the record");
      } catch (error) {
        setSaveStatus("error");
        setSaveLabel("Add to the record");
        setSaveError(error instanceof Error ? error.message : "We could not add this to the record.");
      }
      return;
    }

    setSaveStatus("saving");
    setSaveError("");
    setSaveWarnings([]);
    setSaveLabel("Saving...");

    const issueDetails = Object.fromEntries(
      collectIssueDetails(formState, issueFields).map((detail) => [detail.key, detail.value])
    );

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (normalizedBuildingKey) {
        headers["x-building-key"] = normalizedBuildingKey;
      }
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers,
        // The Email and Text buttons switch to another app. keepalive lets the save finish.
        keepalive: true,
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
          ? payload.details.filter((item: unknown): item is string => typeof item === "string")
          : [];
        const detailText = details.length > 0 ? ` ${details.join(" ")}` : "";
        throw new Error(`${payload?.error || "Unable to save this record right now."}${detailText}`);
      }

      setSubmissionUrl(payload.url || "");
      setSavedFingerprint(ledgerFingerprint);
      setShareChecks({ names: false, units: false, contact: false });
      setSaveWarnings(Array.isArray(payload?.warnings) ? payload.warnings.filter((item: unknown): item is string => typeof item === "string") : []);
      setSaveStatus("saved");
      setSaveLabel("Saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveLabel("Save record");
      setSaveError(error instanceof Error ? error.message : "We could not save this record.");
    }
  };

  // Copy, Email, and Text also save, unless the resident turned that off. One save per notice.
  const saveOnSend = () => {
    // A follow-up fact says the notice was sent. Copying it or opening the email or text app does
    // not send it, so in record mode the resident taps "I sent it" instead (see the quick banner).
    if (recordContext || !addToLedger || !canSaveLedger || saveStatus === "saving" || saveStatus === "saved") {
      return;
    }
    void handleLedgerSave();
  };

  const handleSendLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isNoticeReady) {
      event.preventDefault();
      return;
    }
    saveOnSend();
  };

  const handleCopyLink = async () => {
    if (!submissionUrl) {
      return;
    }
    await navigator.clipboard.writeText(`${window.location.origin}${submissionUrl}`);
    setLinkCopyLabel("Copied resident link");
    setLinkStatusMessage("Permalink copied.");
    scheduleTimeout("link-copy-label", () => setLinkCopyLabel("Copy resident link"), 1500);
    scheduleTimeout("link-status", () => setLinkStatusMessage(""), 2000);
  };

  const handleBuildingKeyInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBuildingKey(event.currentTarget.value);
  };

  const handleReset = () => {
    const confirmed = window.confirm("Clear this form and start over?");
    if (!confirmed) {
      return;
    }
    setFormState(createInitialFormState(new Date()));
    setCurrentStep(1);
    setPlainMeaningVisible(false);
    setCopyLabel("Copy notice text");
    setSummaryCopyLabel("Copy inspector summary");
    setSaveLabel("Save record");
    setSaveStatus("idle");
    setSaveError("");
    setSaveWarnings([]);
    setSubmissionUrl("");
    setLinkCopyLabel("Copy resident link");
    setNoticeStatusMessage("");
    setExportStatusMessage("");
    setLinkStatusMessage("");
    setShareChecks({ names: false, units: false, contact: false });
    setRepeatLabel("Copy again with today's date");
    setExportAudience("inspector");
    setAddToLedger(true);
    setSavedFingerprint("");
    setRecordContext(null);
    setRecordNote("");
    if (window.location.search.includes("record=")) {
      window.history.replaceState(null, "", `${window.location.pathname}#builder`);
    }
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
    const repeatedText = buildNoticeText(nextState, selectedIssue);
    await navigator.clipboard.writeText(repeatedText);
    setFormState(nextState);
    setRepeatLabel("Copied with today's date");
    setNoticeStatusMessage("Notice copied with today's date.");
    scheduleTimeout("repeat-label", () => setRepeatLabel("Copy again with today's date"), 1600);
    scheduleTimeout("notice-status", () => setNoticeStatusMessage(""), 2000);
  };

  const handleQuickStartDate = (daysAgo: number) => {
    const target = new Date();
    target.setDate(target.getDate() - daysAgo);
    setFormState((prev) => ({
      ...prev,
      startDate: formatDate(target),
    }));
  };

  const summaryItems = [
    { label: "Building", value: formState.building || "Choose a building" },
    { label: "Problem", value: selectedIssue ? formatIssueLabel(selectedIssue.label) : "Choose a problem" },
    { label: "Notice", value: stageLabel },
    { label: "Started", value: formState.startDate ? formatTimelineDate(formState.startDate) : "Add a start date" },
  ];
  // The language the notice is in, which is English when the chosen language is not reviewed.
  const noticeLanguageLabel =
    noticeChoice && noticeChoice.language !== "en"
      ? noticeChoice.language.toUpperCase()
      : noticeChoice?.simpleEnglish
        ? "Very simple English"
        : "English";

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

  const privacyStatus = useMemo(() => {
    const fieldsToScan = [
      formState.building,
      formState.location,
      formState.issueDescription,
      ...detailSummaryItems.map((item) => item.value),
    ];
    const flags = fieldsToScan.flatMap((value) => detectSensitiveContent(String(value || "")));
    const hasUnitHint = flags.includes("unit");
    const hasContactHint = flags.includes("email") || flags.includes("phone");

    return {
      hasUnitHint,
      hasContactHint,
      hasEvidenceNote: Boolean(formState.attachment.trim()),
    };
  }, [detailSummaryItems, formState.attachment, formState.building, formState.issueDescription, formState.location]);

  const savedMetaItems = [
    selectedPortfolio?.label ? { label: "Management company", value: selectedPortfolio.label } : null,
    selectedZone?.label ? { label: "Zone", value: selectedZone.label } : null,
    formState.ticketDate ? { label: "311 ticket date", value: formState.ticketDate } : null,
    formState.ticketNumber ? { label: "311 ticket number", value: formState.ticketNumber } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const timelineEntries = useMemo(
    () =>
      getSubmissionTimelineEntries({
        startDate: formState.startDate,
        reportDate: formState.today,
        firstMessageDate: formState.firstMessageDate,
        ticketDate: formState.ticketDate,
        stage: formState.stage as Stage,
        issue: formState.issue,
      }),
    [
      formState.firstMessageDate,
      formState.issue,
      formState.startDate,
      formState.stage,
      formState.ticketDate,
      formState.today,
    ]
  );

  // Before saving, the builder's timeline is a preview. The notice has not gone out yet.
  const previewTimelineEntries = useMemo(
    () =>
      saveStatus === "saved"
        ? timelineEntries
        : timelineEntries.map((entry) =>
            entry.date === formState.today && sentLabels.has(entry.label)
              ? { ...entry, label: `${entry.label}, if you send it today` }
              : entry
          ),
    [formState.today, saveStatus, timelineEntries]
  );

  const issueGuidance = getIssueGuidance(formState.issue);
  const guidanceScript = issueGuidance ? buildGuidanceScript(issueGuidance.script, formState) : "";
  const ruleCards = useMemo(
    () => collectRuleCards(formState.issue, formState.today),
    [formState.issue, formState.today]
  );

  return (
    <div className="notice-builder-container">
      <div className="layout">
        <section className="panel" id="builder">
            <StepProgressHeader
              currentStep={currentStep}
              totalSteps={steps.length}
              stepProgress={stepProgress}
              currentStepLabel={currentStepInfo.label}
            />
            <Tabs.Root
              value={String(currentStep)}
              onValueChange={(val) => {
                const nextStep = Number(val);
                if (!isNaN(nextStep) && (nextStep === 1 || isStep1Complete)) {
                  setCurrentStep(nextStep);
                }
              }}
            >
              <Tabs.List className="step-nav" aria-label="Notice builder steps">
                {visibleBuilderSteps.map((step) => {
                  const isLocked = stepsLocked && step.id > 1;
                  return (
                    <Tabs.Tab
                      key={step.id}
                      value={String(step.id)}
                      disabled={isLocked}
                      onClick={() => {
                        if (!isLocked) {
                          setCurrentStep(step.id);
                        }
                      }}
                      className={`step-button ${currentStep === step.id ? "active" : ""}${isLocked ? " disabled" : ""}`}
                      aria-current={currentStep === step.id ? "step" : undefined}
                      title={isLocked ? "Complete step 1 first to unlock" : `Go to Step ${step.id}: ${step.label}`}
                    >
                      <div className="step-button-top">
                        <span className="step-number-circle" aria-hidden="true">
                          {currentStep > step.id ? "✓" : step.id}
                        </span>
                        <span className="step-title">{step.title}</span>
                      </div>
                      <span className="step-label">{step.label}</span>
                      {step.requirement === "Optional" && <span className="step-requirement">Optional</span>}
                    </Tabs.Tab>
                  );
                })}
              </Tabs.List>
              {stepsLocked && <p className="helper">Choose a building and a problem to open the next steps.</p>}
              {/* Enter in a field must not submit this form. A submit reloads the page and loses the draft. */}
              <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
                <Tabs.Panel value="1">
                  <div className="form-section">
                    <div className="form-section-header">
                      <h3>Building basics</h3>
                      {!basicsFolded && <p className="helper">Required first.</p>}
                    </div>
                    {basicsFolded ? (
                      <div className="basics-summary" data-issue={formState.issue}>
                        <span className="issue-icon" aria-hidden="true">{issueIcons[formState.issue]}</span>
                        <p className="basics-summary-text">
                          <strong>{formatIssueLabel(selectedIssue?.label || "")}</strong>
                          <span>{formState.building}</span>
                        </p>
                        {recordContext ? (
                          // A record's notice keeps the record's building and problem. A different
                          // problem is a new notice.
                          <a className="link-button" href="/#builder">Write a different notice</a>
                        ) : (
                          <button
                            type="button"
                            className="link-button"
                            aria-label="Change the building or the problem"
                            onClick={() => {
                              setFoldBasics(false);
                              setFocusTarget('.issue-option-card[aria-checked="true"]');
                            }}
                          >
                            Change
                          </button>
                        )}
                      </div>
                    ) : (
                    <>
                    <label>
                      Building
                      <SelectField
                        value={formState.building || null}
                        onValueChange={(value) =>
                          setFormState((prev) => ({
                            ...prev,
                            building: value ?? "",
                            portfolio: value ? "continuum" : prev.portfolio,
                          }))
                        }
                        options={buildingSelectOptions}
                        ariaLabel="Building"
                        placeholder="Select building"
                        required
                      />
                    </label>

                    <div className="issue-gallery">
                      <div>
                        <h3 id="issue-gallery-title">Choose the issue type</h3>
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
                          setScrollTarget(".quick-start-date");
                        }}
                        onClick={(event: React.MouseEvent<HTMLElement>) => {
                          // detail is 0 for a click from the keyboard. Only a tap or a mouse click folds.
                          if (event.detail > 0 && (event.target as HTMLElement).closest(".issue-option-card")) {
                            setFoldBasics(true);
                            setFocusTarget(".basics-summary .link-button");
                          }
                        }}
                        required
                      >
                        {issueOptions.map((option) => (
                          <RadioGroup.Item
                            key={option.id}
                            render={<div />}
                            className={`issue-option-card ${formState.issue === option.id ? "active" : ""}`}
                            data-issue={option.id}
                            value={option.id}
                            aria-label={formatIssueLabel(option.label)}
                          >
                            <div className="issue-icon">{issueIcons[option.id]}</div>
                            <p className="issue-label">{formatIssueLabel(option.label)}</p>
                          </RadioGroup.Item>
                        ))}
                      </RadioGroup.Root>
                    </div>
                    {isStep1Complete && (
                      <Button
                        className="button button-secondary button-compact basics-done"
                        type="button"
                        onClick={() => {
                          setFoldBasics(true);
                          setFocusTarget(".basics-summary .link-button");
                        }}
                      >
                        Done
                      </Button>
                    )}
                    </>
                    )}

                    {formState.issue === "heat" && (
                      <div className="helper-card" role="note" style={{ marginTop: "12px" }}>
                        <p className="helper">
                          <strong>Chicago heat rule ({heatSeasonLabel}):</strong>{" "}
                          {isInHeatSeason(formState.today || undefined)
                            ? "It is heat season now."
                            : "It is not heat season now."}{" "}
                          {heatMinimumLines.join(" ")}
                        </p>
                      </div>
                    )}

                    {isNoticeReady && (
                      <div className="quick-start-date" role="region" aria-label="When problem started">
                        <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          When did this problem start?
                        </label>
                        <div className="fact-tag-row">
                          <button
                            type="button"
                            className={`fact-tag ${formState.startDate === formatDate(new Date()) ? "fact-tag-included" : ""}`}
                            onClick={() => handleQuickStartDate(0)}
                          >
                            Today
                          </button>
                          <button
                            type="button"
                            className={`fact-tag ${(() => {
                              const d = new Date();
                              d.setDate(d.getDate() - 1);
                              return formState.startDate === formatDate(d) ? "fact-tag-included" : "";
                            })()}`}
                            onClick={() => handleQuickStartDate(1)}
                          >
                            Yesterday
                          </button>
                          <button
                            type="button"
                            className={`fact-tag ${(() => {
                              const d = new Date();
                              d.setDate(d.getDate() - 3);
                              return formState.startDate === formatDate(d) ? "fact-tag-included" : "";
                            })()}`}
                            onClick={() => handleQuickStartDate(3)}
                          >
                            3 days ago
                          </button>
                          <button
                            type="button"
                            className={`fact-tag ${(() => {
                              const d = new Date();
                              d.setDate(d.getDate() - 7);
                              return formState.startDate === formatDate(d) ? "fact-tag-included" : "";
                            })()}`}
                            onClick={() => handleQuickStartDate(7)}
                          >
                            1 week ago
                          </button>
                        </div>
                      </div>
                    )}

                    {isNoticeReady && (
                      <div className="quick-notice-banner" role="region" aria-label="Quick notice actions">
                        {/* The language comes before the send buttons, so the notice is in the right language when it is copied. */}
                        <div className="fact-tags">
                          <div className="fact-tag-row" role="group" aria-label="Notice language">
                            <span className="helper" style={{ alignSelf: "center", marginRight: "4px" }}>Notice language:</span>
                            <button
                              type="button"
                              className={`fact-tag ${formState.language === "en" && formState.simpleEnglish ? "fact-tag-included" : ""}`}
                              aria-pressed={formState.language === "en" && formState.simpleEnglish}
                              onClick={() => setFormState((prev) => ({ ...prev, language: "en", simpleEnglish: true }))}
                            >
                              Simple English
                            </button>
                            <button
                              type="button"
                              className={`fact-tag ${formState.language === "en" && !formState.simpleEnglish ? "fact-tag-included" : ""}`}
                              aria-pressed={formState.language === "en" && !formState.simpleEnglish}
                              onClick={() => setFormState((prev) => ({ ...prev, language: "en", simpleEnglish: false }))}
                            >
                              Standard English
                            </button>
                            <button
                              type="button"
                              className={`fact-tag ${formState.language === "es" ? "fact-tag-included" : ""}`}
                              aria-pressed={formState.language === "es"}
                              onClick={() => setFormState((prev) => ({ ...prev, language: "es", simpleEnglish: false }))}
                            >
                              Español
                            </button>
                            <button
                              type="button"
                              className={`fact-tag ${formState.language === "pl" ? "fact-tag-included" : ""}`}
                              aria-pressed={formState.language === "pl"}
                              onClick={() => setFormState((prev) => ({ ...prev, language: "pl", simpleEnglish: false }))}
                            >
                              Polski
                            </button>
                          </div>
                        </div>
                        <WithheldNoticeNote note={withheldNote} />
                        <div className="quick-notice-top-row">
                          <div className="quick-notice-info">
                            <span className="quick-notice-title">
                              {recordContext
                                ? formState.stage === "C"
                                  ? "Final reminder ready to send"
                                  : formState.stage === "B"
                                    ? "Follow-up ready to send"
                                    : "Notice ready to send"
                                : "Notice ready to send"}
                            </span>
                            <span className="quick-notice-subtitle">
                              {formState.building} • {formatIssueLabel(selectedIssue?.label || "")} • Started {formState.startDate ? formatTimelineDate(formState.startDate) : "today"}
                            </span>
                          </div>
                          <div className="quick-notice-actions">
                            <Button className="button button-compact" type="button" onClick={handleCopy}>
                              {copyLabel}
                            </Button>
                            <a
                              className="button button-secondary button-compact"
                              href={noticeEmailHref}
                              onClick={handleSendLink}
                              title="Open in your email app with notice pre-filled"
                            >
                              ✉️ Email
                            </a>
                            <a
                              className="button button-secondary button-compact"
                              href={noticeSmsHref}
                              onClick={handleSendLink}
                              title="Open in your text messaging app with notice pre-filled"
                            >
                              💬 Text
                            </a>
                            <Button
                              className="button button-secondary button-compact"
                              type="button"
                              onClick={() => setCurrentStep(4)}
                            >
                              {saveStatus === "saved" ? "Review →" : "Review & Save →"}
                            </Button>
                          </div>
                        </div>

                        {sendTo && (
                          <div className="send-to" role="note" aria-label="Where to send it">
                            <p className="helper"><strong>Send it to</strong> (saved by a steward on {formatTimelineDate(sendTo.updatedAt)}. Check it against your lease.)</p>
                            <ul className="send-to-list">
                              {sendTo.lines.map((line) => (
                                <li key={line.label}>
                                  <span>{line.label}:</span> {line.value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <details className="quick-notice-text">
                          <summary>See the notice</summary>
                          <pre className="output-notice">{noticeText}</pre>
                        </details>

                        {/* Saving comes right after the send buttons, so "I sent it" is on the same screen. */}
                        {hasSaveAccess && !recordContext && saveStatus !== "saved" && (
                          <label className="checkbox-label quick-save-option">
                            <input
                              type="checkbox"
                              checked={addToLedger}
                              onChange={(event) => setAddToLedger(event.currentTarget.checked)}
                            />
                            When you send, also save it to your building's record. Neighbors with the building key can see the problem and the dates, never your name.
                          </label>
                        )}
                        {recordLockNote && saveStatus !== "saved" && <p className="helper">{recordLockNote}</p>}
                        {hasSaveAccess && recordContext && recordFactType && saveStatus !== "saved" && (
                          <div className="quick-save-option">
                            <p className="helper">After you send it, tap the button below.</p>
                            <Button
                              className="button button-compact"
                              type="button"
                              onClick={handleLedgerSave}
                              disabled={saveStatus === "saving"}
                            >
                              I sent it. Add “{recordFactLabel}” to the record
                            </Button>
                          </div>
                        )}
                        {saveStatus === "saving" && <p className="helper" role="status">Saving…</p>}
                        {saveStatus === "saved" && submissionUrl && (
                          <p className="helper" role="status">
                            {recordContext
                              ? `Added “${recordFactLabel}” to the record.`
                              : changedSinceSave
                                ? "You changed the notice after it was saved. The record keeps the first version."
                                : "Saved to your building's record."}{" "}
                            <a href={submissionUrl}>Open the record</a>
                          </p>
                        )}
                        {saveStatus === "error" && saveError && (
                          <p className="submission-error" role="alert">{saveError}</p>
                        )}

                        <p className="helper">
                          Tenant Tools does not send anything. Email and Text open your own app with the notice filled
                          in. Nothing goes out until you press send there.
                        </p>
                        {recordNote && <p className="helper" role="status">{recordNote}</p>}
                        {recordContext && (
                          <p className="helper">
                            For the <a href={recordContext.url}>saved record</a>
                            {recordContext.startDate ? ` that started ${formatTimelineDate(recordContext.startDate)}` : ""}. It
                            uses the dates saved there.
                          </p>
                        )}
                      </div>
                    )}

                    {isStep1Complete ? (
                      <>
                        <div className="optional-setup">
                          <button
                            className="link-button"
                            type="button"
                            onClick={() => setShowOptionalSetup((prev) => !prev)}
                            aria-expanded={showOptionalSetup}
                          >
                            {showOptionalSetup ? "Hide extra options" : "Show extra options"}
                          </button>
                          {showOptionalSetup && (
                            <>
                              <p className="helper">You can skip this now.</p>
                              <div className="optional-setup-body">
                        <label>
                          Location zone (optional)
                          <SelectField
                            value={formState.zone || null}
                            onValueChange={updateSelect("zone")}
                            options={zoneOptions}
                            ariaLabel="Issue location zone"
                            placeholder="Select zone"
                          />
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
                                  <p className="helper">{option.description}</p>
                                </div>
                              </RadioGroup.Item>
                            ))}
                          </RadioGroup.Root>
                        </fieldset>
                              </div>
                            </>
                          )}
                        </div>

                      </>
                    ) : null}

                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="2">
                  {showLockedStepPlaceholder ? (
                    <section className="locked-panel" aria-label="Step 2 locked">
                      <h3>Step 2 is locked</h3>
                      <p className="helper">Complete step 1 first.</p>
                    </section>
                  ) : (
                    <>
                  <div className="form-section">
                    <div className="form-section-header">
                      <h3>Language and style</h3>
                      <p className="helper">Short language setup.</p>
                    </div>
                    <label>
                      Language
                      <SelectField
                        value={formState.language}
                        onValueChange={updateSelect("language")}
                        options={languageOptions}
                        ariaLabel="Language"
                        placeholder="Select language"
                        required
                      />
                    </label>
                    <WithheldNoticeNote note={withheldNote} />

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
                      <div className="fact-tags" aria-label="Quick start date choices">
                        <p className="helper">Quick set:</p>
                        <div className="fact-tag-row">
                          <button
                            type="button"
                            className={`fact-tag ${formState.startDate === formatDate(new Date()) ? "fact-tag-included" : ""}`}
                            onClick={() => handleQuickStartDate(0)}
                          >
                            Today
                          </button>
                          <button
                            type="button"
                            className="fact-tag"
                            onClick={() => handleQuickStartDate(1)}
                          >
                            Yesterday
                          </button>
                          <button
                            type="button"
                            className="fact-tag"
                            onClick={() => handleQuickStartDate(3)}
                          >
                            3 days ago
                          </button>
                          <button
                            type="button"
                            className="fact-tag"
                            onClick={() => handleQuickStartDate(7)}
                          >
                            1 week ago
                          </button>
                          <button
                            type="button"
                            className="fact-tag"
                            onClick={() => handleQuickStartDate(14)}
                          >
                            2 weeks ago
                          </button>
                        </div>
                      </div>
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
                    </>
                  )}

                </Tabs.Panel>

                <Tabs.Panel value="3">
                  {showLockedStepPlaceholder ? (
                    <section className="locked-panel" aria-label="Step 3 locked">
                      <h3>Step 3 is locked</h3>
                      <p className="helper">Complete step 1 first.</p>
                    </section>
                  ) : (
                    <>
                      <p className="helper">Optional facts and evidence. {evidenceSafetySummary}</p>
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
                          <div className="form-section">
                            <div className="form-section-header">
                              <h3>Your lease</h3>
                              <p className="helper">
                                Optional. To quote your lease, copy the section number and its exact words. Check that both come from the same part of the lease.
                              </p>
                            </div>
                            <label>
                              Section number
                              <input
                                className="input"
                                type="text"
                                inputMode="text"
                                maxLength={12}
                                value={formState.leaseSection}
                                onChange={(event) => setFormState((prev) => ({ ...prev, leaseSection: event.target.value }))}
                                placeholder="7"
                              />
                            </label>
                            <label>
                              The exact words
                              <textarea
                                className="input"
                                rows={3}
                                maxLength={leaseQuoteLimit}
                                value={formState.leaseQuote}
                                onChange={(event) => setFormState((prev) => ({ ...prev, leaseQuote: event.target.value }))}
                                placeholder="Copy one or two sentences from your lease."
                              />
                            </label>
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={formState.leaseChecked}
                                onChange={(event) => setFormState((prev) => ({ ...prev, leaseChecked: event.target.checked }))}
                              />
                              The section number and the words come from the same part of my lease.
                            </label>
                            {formState.leaseSection.trim() && formState.leaseQuote.trim() && !formState.leaseChecked && (
                              <p className="helper" role="status">The quote goes into the notice after you check the box.</p>
                            )}
                            {rentCreditIssues.has(formState.issue) && (
                              <p className="helper-card helper-note" role="note">
                                Paying less rent can lead to an eviction case. Talk to a tenant group or legal aid before you pay less.
                              </p>
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
                    </>
                  )}
                </Tabs.Panel>

                <Tabs.Panel value="4">
                  {showLockedStepPlaceholder ? (
                    <section className="locked-panel" aria-label="Step 4 locked">
                      <h3>Step 4 is locked</h3>
                      <p className="helper">Complete step 1 first.</p>
                    </section>
                  ) : (
                    <div className="form-section">
                      <div className="form-section-header">
                        <h3>Review and send notice</h3>
                        <p className="helper">Your notice is ready. Read it once, then send it to your landlord or property management.</p>
                      </div>

                      <div className="summary-grid">
                        <div className="summary-card">
                          <p className="summary-label">Building</p>
                          <p className="summary-value">{formState.building || "None selected"}</p>
                        </div>
                        <div className="summary-card">
                          <p className="summary-label">Issue</p>
                          <p className="summary-value">{selectedIssue?.label || "None selected"}</p>
                        </div>
                        <div className="summary-card">
                          <p className="summary-label">Start date</p>
                          <p className="summary-value">{formState.startDate ? formatTimelineDate(formState.startDate) : "Today"}</p>
                        </div>
                        <div className="summary-card">
                          <p className="summary-label">Days open</p>
                          <p className="summary-value">{daysOpen} day{daysOpen === 1 ? "" : "s"}</p>
                        </div>
                      </div>

                      <div className="output-actions">
                        <Button
                          className="button"
                          type="button"
                          onClick={handleCopy}
                          disabled={!isNoticeReady}
                        >
                          {copyLabel}
                        </Button>
                        <a
                          className="button button-secondary"
                          href={noticeEmailHref}
                          aria-disabled={!isNoticeReady}
                          onClick={handleSendLink}
                        >
                          ✉️ Email notice
                        </a>
                        <a
                          className="button button-secondary"
                          href={noticeSmsHref}
                          aria-disabled={!isNoticeReady}
                          onClick={handleSendLink}
                        >
                          💬 Text notice
                        </a>
                        <Button
                          className="button button-secondary"
                          type="button"
                          onClick={handleRepeatNotice}
                          disabled={!isNoticeReady}
                        >
                          {repeatLabel}
                        </Button>
                      </div>

                      {noticeStatusMessage && (
                        <p className="submission-note" role="status" aria-live="polite">
                          {noticeStatusMessage}
                        </p>
                      )}

                      <WithheldNoticeNote note={withheldNote} />
                      <label>
                        Notice text
                        <pre className="output-notice">{noticeText}</pre>
                      </label>

                      <div className="helper-card">
                        <p className="helper">
                          <strong>Next step:</strong> Send this notice yourself, by email, text message, or the resident portal. Tenant Tools does not send it. Keep a screenshot of your message and the date you sent it.
                        </p>
                      </div>
                    </div>
                  )}
                </Tabs.Panel>
              </form>
            </Tabs.Root>

            <div className="step-controls">
              {currentStep > 1 && (
                <Button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                >
                  Back
                </Button>
              )}
              <Button
                className="button"
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
                disabled={currentStep === steps.length || (currentStep === 1 && !isStep1Complete)}
              >
                {currentStep === 1
                  ? !formState.building
                    ? "Choose building to continue"
                    : !formState.issue
                      ? "Choose issue type to continue"
                      : "Continue to details (Step 2) →"
                  : currentStep === 2
                    ? "Continue to facts (Step 3) →"
                    : currentStep === 3
                      ? "Review notice & copy (Step 4) →"
                      : "Notice ready"}
              </Button>
            </div>
            {isStep1Complete && (
              <p className="helper" role="status" aria-live="polite">
                {saveStatus === "saved"
                  ? recordContext
                    ? "Added to the record."
                    : changedSinceSave
                      ? "Saved before your changes. The record keeps the first version."
                      : "Saved to your building's record."
                  : recordContext
                    ? recordFactType
                      ? "After you send it, tap “I sent it” to add it to the record."
                      : recordLockNote || "Nothing is added to the record for this notice."
                    : addToLedger && canSaveLedger
                      ? "Copy, Email, or Text also saves it to your building's record."
                      : hasSaveAccess
                        ? "Saving to your building's record is optional. You can save in step 4."
                        : "You can send the notice now. Saving it to your building's record is optional and needs the building key from a neighbor or steward."}
              </p>
            )}
          </section>
          <aside className={`panel panel-highlight preview-panel${!canShowAfterBasics || currentStep < 4 ? " preview-panel-mobile-hidden" : ""}`} id="preview">
            <div className="output-header preview-duplicate">
              <h2>Generated notice</h2>
              {canShowAfterBasics && (
                <div className="output-actions">
                  <Button className="button" type="button" onClick={handleCopy} disabled={!isNoticeReady}>
                    {copyLabel}
                  </Button>
                  <a
                    className="button button-secondary"
                    href={noticeEmailHref}
                    aria-disabled={!isNoticeReady}
                    onClick={handleSendLink}
                    title="Open in your email app with notice pre-filled"
                  >
                    ✉️ Email
                  </a>
                  <a
                    className="button button-secondary"
                    href={noticeSmsHref}
                    aria-disabled={!isNoticeReady}
                    onClick={handleSendLink}
                    title="Open in your text messaging app with notice pre-filled"
                  >
                    💬 Text
                  </a>
                  <Button className="button button-secondary" type="button" onClick={handleRepeatNotice} disabled={!isNoticeReady}>
                    {repeatLabel}
                  </Button>
                </div>
              )}
            </div>
            {!canShowAfterBasics ? (
              <section className="preview-section">
                <div className="notice-status needs">
                  <p className="notice-status-title">Finish the basics</p>
                  <p className="helper">Choose a building and issue in step 1. Then preview and save options appear.</p>
                </div>
              </section>
            ) : (
              <>
                {copyDisabledReason && <p className="helper action-hint">{copyDisabledReason}</p>}
                <p className="helper preview-duplicate" role="status" aria-live="polite">
                  {noticeStatusMessage}
                </p>
                <section className="preview-section preview-duplicate">
                  <div className={`notice-status ${isNoticeReady ? "ready" : "needs"}`}>
                    <p className="notice-status-title">{noticeReadinessTitle}</p>
                  </div>
                </section>
          <section className="preview-section preview-duplicate">
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
          </section>
          <section className="preview-section preview-duplicate">
            <div className="notice-preview">
              <div className="notice-preview-header">
                <div>
                  <p className="notice-preview-title">Send to management</p>
                  <p className="helper">Use this text for your notice.</p>
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
                  <details className="helper-card share-summary">
                  <summary>Share a summary with an inspector or legal aid (optional)</summary>
                  <div className="export-header">
                    <div>
                      <p className="helper">Pick who it is for. {selectedAudience.description}</p>
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
                      <SelectField
                        value={formState.exportStatus}
                        onValueChange={updateSelect("exportStatus")}
                        options={exportStatusOptions}
                        ariaLabel="Issue status"
                        placeholder="Select status"
                        required
                      />
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
                  </details>
                  <div className="submission-block">
                    <div>
                      <h3>Save to your building's record (optional)</h3>
                      <p className="helper">
                        Saving lets neighbors with the building key see this problem and tap “Me too”. It does not send
                        anything to management. Your name is never saved.
                      </p>
                      {hasResidentSession ? (
                        <ResidentSessionNote />
                      ) : (
                        <>
                          <p className="helper">
                            Paste the building key from a neighbor or steward. No key? You can still send the notice. Keep
                            the key private.
                          </p>
                          <label>
                            Building key
                            <Input
                              className="input"
                              type="password"
                              value={buildingKey}
                              onChange={handleBuildingKeyInput}
                              placeholder="Paste the building key"
                              autoComplete="off"
                              spellCheck={false}
                            />
                          </label>
                        </>
                      )}
                      {saveDisabledMessage ? (
                        <p className="helper">{saveDisabledMessage}</p>
                      ) : null}
                    </div>
                    <div className="share-checklist-inline" aria-label="Privacy checks before sharing">
                      <p className="helper">Read the notice once more. Check each box before you share the record link.</p>
                      <label className="checkbox-label">
                        <Checkbox.Root
                          checked={shareChecks.names}
                          onCheckedChange={(checked) => setShareChecks((prev) => ({ ...prev, names: checked === true }))}
                          className="checkbox-root"
                        >
                          <Checkbox.Indicator className="checkbox-indicator">✓</Checkbox.Indicator>
                        </Checkbox.Root>
                        I removed names.
                      </label>
                      <label className="checkbox-label">
                        <Checkbox.Root
                          checked={shareChecks.units}
                          onCheckedChange={(checked) => setShareChecks((prev) => ({ ...prev, units: checked === true }))}
                          className="checkbox-root"
                        >
                          <Checkbox.Indicator className="checkbox-indicator">✓</Checkbox.Indicator>
                        </Checkbox.Root>
                        I removed unit numbers.
                      </label>
                      <label className="checkbox-label">
                        <Checkbox.Root
                          checked={shareChecks.contact}
                          onCheckedChange={(checked) => setShareChecks((prev) => ({ ...prev, contact: checked === true }))}
                          className="checkbox-root"
                        >
                          <Checkbox.Indicator className="checkbox-indicator">✓</Checkbox.Indicator>
                        </Checkbox.Root>
                        I removed phone numbers and email addresses.
                      </label>
                      <p className="helper" role="status" aria-live="polite">
                        {canCopyPermalink ? "All checked. You can copy the record link." : "Check all three boxes to copy the record link."}
                      </p>
                    </div>
                    <div className="submission-actions">
                      <Button
                        className="button button-secondary"
                        type="button"
                        onClick={handleLedgerSave}
                        disabled={!canSaveLedger || saveStatus === "saving" || saveStatus === "saved"}
                      >
                        {saveLabel}
                      </Button>
                      {submissionUrl && (
                        <Button
                          className="button button-secondary"
                          type="button"
                          onClick={handleCopyLink}
                          disabled={!canCopyPermalink}
                          aria-disabled={!canCopyPermalink}
                          title={canCopyPermalink ? "Copy the record link" : "Check all three boxes to copy the record link"}
                          aria-describedby={!canCopyPermalink ? "copy-link-requirements" : undefined}
                        >
                          {linkCopyLabel}
                        </Button>
                      )}
                    </div>
                    {submissionUrl && !canCopyPermalink && (
                      <p className="helper" id="copy-link-requirements" role="status" aria-live="polite">Check all three boxes above to copy the record link.</p>
                    )}
                    {saveStatus === "saved" && submissionUrl && (
                      <p className="submission-note" role="status" aria-live="polite">
                        Saved. Record link: <a href={submissionUrl}>{submissionUrl}</a>. The link does not include the building key, so it is safe to keep. Whoever opens it needs the key to see the record.
                      </p>
                    )}
                    {saveStatus === "error" && (
                      <p className="submission-error" role="alert">
                        {saveError || "The record was not saved. Your notice is still here. Copy it, send it, and try saving again later."}
                      </p>
                    )}
                    {saveStatus === "saved" && saveWarnings.length > 0 && (
                      <div className="export-block" role="status" aria-live="polite">
                        <p className="helper">Saved. Check these before you share the record link:</p>
                        <ul className="helper-list">
                          {saveWarnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="privacy-strip" aria-live="polite">
                      <p className={`privacy-chip ${privacyStatus.hasContactHint ? "risk" : "ok"}`}>
                        {privacyStatus.hasContactHint ? "Contact info found" : "No contact info found"}
                      </p>
                      <p className={`privacy-chip ${privacyStatus.hasUnitHint ? "risk" : "ok"}`}>
                        {privacyStatus.hasUnitHint ? "Unit hint found" : "No unit hints found"}
                      </p>
                      <p className={`privacy-chip ${privacyStatus.hasEvidenceNote ? "ok" : "neutral"}`}>
                        {privacyStatus.hasEvidenceNote ? "Evidence note included" : "No evidence note"}
                      </p>
                    </div>
                    {linkStatusMessage && (
                      <p className="helper" role="status" aria-live="polite">
                        {linkStatusMessage}
                      </p>
                    )}
                    {(detailSummaryItems.length > 0 || savedMetaItems.length > 0) && (
                      <div className="submission-details">
                        <p className="helper">Also saved with the record:</p>
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
                    <details className="more-actions">
                      <summary>More actions</summary>
                      <button className="link-button danger-link" type="button" onClick={handleReset}>
                        Clear form and start over
                      </button>
                    </details>
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
              </>
            )}
          </aside>
        </div>

        <RecordPanel
          canShowAfterBasics={canShowAfterBasics}
          hideOnPhone={currentStep < 4}
          onGoToStep1={() => setCurrentStep(1)}
          timelineEntries={previewTimelineEntries}
          visibleNextSteps={visibleNextSteps}
          impactCount={impactCount}
          issueGuidance={issueGuidance}
          guidanceScript={guidanceScript}
          ruleCards={ruleCards}
        />

      <footer className="site-footer">
        <p>
          Nothing here is public. Saved records are seen only by residents with your building's key. Names, emails, and
          phone numbers are never saved.
        </p>
      </footer>
    </div>
  );
};

export default NoticeBuilder;
