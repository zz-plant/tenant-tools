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
import { buildExportSummary, type ExportAudience } from "../lib/exportSummary";
import useTimedCallbacks from "../hooks/useTimedCallbacks";
import { formatDate, getCurrentTime } from "../lib/dateUtils";
import { formatIssueLabel, getVisibleUnlockableSteps } from "../lib/noticeUtils";
import { detectSensitiveContent } from "../lib/validation";
import {
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
  collectIssueDetails,
  collectRuleSources,
  computeDaysOpen,
  createInitialFormState,
  getIssueGuidance,
  type FormState,
  type IssueFieldKey,
} from "./noticeBuilder/logic";
import { getSubmissionTimelineEntries } from "../lib/submissionTimeline";
import type { Stage } from "./noticeBuilder/types";


const detailEntries = Object.entries(fieldDefinitions);

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

const RadioGroup = {
  Root: BaseRadioGroup,
  Item: Radio.Root,
};


type NoticeBuilderProps = {
  buildingOptions?: BuildingOption[];
  /** Building ids the resident key cookie on this device unlocks. `"*"` means every building. */
  residentBuildings?: string[];
};

const NoticeBuilder = ({ buildingOptions = defaultBuildingOptions, residentBuildings = [] }: NoticeBuilderProps) => {
  const [formState, setFormState] = useState<FormState>(() => createInitialFormState());
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
  const [repeatLabel, setRepeatLabel] = useState("Repeat with today's date");
  const [exportAudience, setExportAudience] = useState<ExportAudience>("inspector");
  const [noticeStatusMessage, setNoticeStatusMessage] = useState("");
  const [exportStatusMessage, setExportStatusMessage] = useState("");
  const [linkStatusMessage, setLinkStatusMessage] = useState("");
  const [shareChecks, setShareChecks] = useState({ names: false, units: false, contact: false });
  const [showOptionalSetup, setShowOptionalSetup] = useState(false);
  const { scheduleTimeout } = useTimedCallbacks();
  const stepProgress = Math.round((currentStep / steps.length) * 100);
  const currentStepInfo = steps[currentStep - 1];
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
  const canSaveLedger = Boolean(formState.building && formState.issue && hasSaveAccess);
  const saveDisabledMessage = !formState.building || !formState.issue
    ? "Choose a building and issue to enable saving."
    : !hasSaveAccess
      ? "Add the resident key to enable saving."
      : "";
  const canCopyPermalink = shareChecks.names && shareChecks.units && shareChecks.contact;
  const saveReadinessLabel = canSaveLedger
    ? "Ready to save"
    : hasSaveAccess
      ? "Choose a building and issue to save"
      : "Resident key missing";

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

  const noticeText = useMemo(() => buildNoticeText(formState, selectedIssue), [formState, selectedIssue]);

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
    setRepeatLabel("Repeat with today's date");
    setExportAudience("inspector");
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
    selectedPortfolio?.label ? { label: "Portfolio", value: selectedPortfolio.label } : null,
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
      }),
    [formState.firstMessageDate, formState.startDate, formState.stage, formState.ticketDate, formState.today]
  );

  const issueGuidance = getIssueGuidance(formState.issue);
  const guidanceScript = issueGuidance ? buildGuidanceScript(issueGuidance.script, formState) : "";
  const ruleSources = useMemo(() => collectRuleSources(formState.issue), [formState.issue]);

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <main id="main">
        <div className="layout">
          <section className="panel" id="builder">
            <StepProgressHeader
              currentStep={currentStep}
              totalSteps={steps.length}
              stepProgress={stepProgress}
              progressPillLabel={progressPillLabel}
              stepsLocked={stepsLocked}
              currentStepLabel={currentStepInfo.label}
            />
            <Tabs.Root value={String(currentStep)}>
              <Tabs.List className="step-nav">
                {visibleBuilderSteps.map((step) => {
                  const isLocked = stepsLocked && step.id > 1;
                  return (
                    <Tabs.Tab
                      key={step.id}
                      value={String(step.id)}
                      disabled={true}
                      className={`step-button ${currentStep === step.id ? "active" : ""}${isLocked ? " disabled" : ""}`}
                      aria-current={currentStep === step.id ? "step" : undefined}
                    >
                      <span className="step-title">{step.title}</span>
                      <span className="step-label">{step.label}</span>
                      <span className="step-requirement">{step.requirement}</span>
                      {isLocked && <span className="step-lock-note">Locked</span>}
                    </Tabs.Tab>
                  );
                })}
              </Tabs.List>
              {stepsLocked && <p className="helper">Complete step 1 to unlock steps 2 to 4.</p>}
              <p className="helper">Use Next to continue. You can go back any time.</p>
              <p className="helper mobile-step-hint">Use step buttons above on mobile.</p>
              <form className="form-grid">
                <Tabs.Panel value="1">
                  <div className="form-section">
                    <div className="form-section-header">
                      <h3>Building basics</h3>
                      <p className="helper">Required first.</p>
                    </div>
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
                        }}
                        required
                      >
                        {issueOptions.map((option) => (
                          <RadioGroup.Item
                            key={option.id}
                            render={<div />}
                            className={`issue-option-card ${formState.issue === option.id ? "active" : ""}`}
                            value={option.id}
                            aria-label={formatIssueLabel(option.label)}
                          >
                            <div className="issue-icon">{issueIcons[option.id]}</div>
                            <p className="issue-label">{formatIssueLabel(option.label)}</p>
                          </RadioGroup.Item>
                        ))}
                      </RadioGroup.Root>
                    </div>

                    {!hasResidentSession && (
                      <p className="helper">You can draft a notice now. Add the resident key later when you save.</p>
                    )}

                    <div className="submission-block">
                      <h3>Resident key for saving</h3>
                      {hasResidentSession ? (
                        <ResidentSessionNote />
                      ) : (
                        <>
                          <p className="helper">You can draft without a key. Saving needs this key.</p>
                          <label>
                            Resident key
                            <Input
                              className="input"
                              type="password"
                              value={buildingKey}
                              onChange={handleBuildingKeyInput}
                              placeholder="Paste resident key"
                              autoComplete="off"
                              spellCheck={false}
                            />
                          </label>
                        </>
                      )}
                      <p className="helper" role="status" aria-live="polite">
                        {saveReadinessLabel}
                      </p>
                    </div>

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
                    <p className="helper">
                      Review the preview. Copy and save. Dates and repeats help.
                    </p>
                  )}
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
                {currentStep === 1 && !isStep1Complete ? "Finish step 1 to continue" : "Next"}
              </Button>
            </div>
            {isStep1Complete && (
              <p className="helper" role="status" aria-live="polite">
                Save status: {saveReadinessLabel}. Saving is in step 4.
              </p>
            )}
          </section>
          <aside className={`panel panel-highlight preview-panel${!canShowAfterBasics ? " preview-panel-mobile-hidden" : ""}`} id="preview">
            <div className="output-header">
              <h2>Generated notice</h2>
              {canShowAfterBasics && (
                <div className="output-actions">
                  <Button className="button" type="button" onClick={handleCopy} disabled={!isNoticeReady}>
                    {copyLabel}
                  </Button>
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
                <p className="helper" role="status" aria-live="polite">
                  {noticeStatusMessage}
                </p>
                <section className="preview-section">
                  <div className={`notice-status ${isNoticeReady ? "ready" : "needs"}`}>
                    <p className="notice-status-title">{noticeReadinessTitle}</p>
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
          </section>
          <section className="preview-section">
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
                  <div className="export-header">
                    <div>
                      <h3>Share with inspector or aid</h3>
                      <p className="helper">Sharing result: {selectedAudience.description}</p>
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
                  <div className="submission-block">
                    <div>
                      <h3>Save in resident ledger</h3>
                      {hasResidentSession ? (
                        <ResidentSessionNote />
                      ) : (
                        <>
                          <p className="helper">Use the resident key from your organizer. Keep this key private.</p>
                          <label>
                            Resident key
                            <Input
                              className="input"
                              type="password"
                              value={buildingKey}
                              onChange={handleBuildingKeyInput}
                              placeholder="Paste resident key"
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
                      <p className="helper">Before saving or sharing, confirm all checks.</p>
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
                        {canCopyPermalink ? "Checklist complete. You can copy the link." : "Complete all checks to copy the link."}
                      </p>
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
                        <Button
                          className="button button-secondary"
                          type="button"
                          onClick={handleCopyLink}
                          disabled={!canCopyPermalink}
                          aria-disabled={!canCopyPermalink}
                          title={canCopyPermalink ? "Copy permalink" : "Complete all checks to copy the link"}
                          aria-describedby={!canCopyPermalink ? "copy-link-requirements" : undefined}
                        >
                          {linkCopyLabel}
                        </Button>
                      )}
                    </div>
                    {submissionUrl && !canCopyPermalink && (
                      <p className="helper" id="copy-link-requirements" role="status" aria-live="polite">Complete all checks below to copy the link.</p>
                    )}
                    {saveStatus === "saved" && submissionUrl && (
                      <p className="submission-note" role="status" aria-live="polite">
                        Saved. Your permalink: <a href={submissionUrl}>{submissionUrl}</a>. This link does not include a resident key. Open it, then enter your building key.
                      </p>
                    )}
                    {saveStatus === "error" && (
                      <p className="submission-error" role="alert">
                        {saveError || "We could not save this record."}
                      </p>
                    )}
                    {saveStatus === "saved" && saveWarnings.length > 0 && (
                      <div className="export-block" role="status" aria-live="polite">
                        <p className="helper">Please review these safety warnings before sharing.</p>
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
                        <p className="helper">Saved record details:</p>
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
          onGoToStep1={() => setCurrentStep(1)}
          timelineEntries={timelineEntries}
          visibleNextSteps={visibleNextSteps}
          daysOpen={daysOpen}
          impactCount={impactCount}
          issueGuidance={issueGuidance}
          guidanceScript={guidanceScript}
          ruleSources={ruleSources}
        />
      </main>

      <footer className="site-footer">
        <p>Safety first: evidence is optional. Public views hide personal details.</p>
      </footer>
    </div>
  );
};

export default NoticeBuilder;
