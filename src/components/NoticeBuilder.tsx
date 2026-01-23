import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@base-ui/react/button";
import { Checkbox } from "@base-ui/react/checkbox";
import { Input } from "@base-ui/react/input";
import { Select } from "@base-ui/react/select";
import { Slider } from "@base-ui/react/slider";
import { Switch } from "@base-ui/react/switch";
import { fieldDefinitions, issueFieldMap, issueOptions, meaningMap, stages } from "../data/noticeData";

const initialState = {
  building: "",
  unit: "",
  issue: "",
  stage: "A",
  language: "en",
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
  yourName: "",
};

type Stage = "A" | "B" | "C";

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

const detailEntries = Object.entries(fieldDefinitions);

const buildingOptions = [
  {
    id: "2353 W Wabansia",
    description: "Brick walk-up with bay windows and a garden entry.",
    svg: (
      <svg viewBox="0 0 160 120" role="img" aria-label="2353 W Wabansia building">
        <rect x="18" y="30" width="124" height="72" rx="6" fill="#f6d5c0" stroke="#c96f52" strokeWidth="2" />
        <rect x="34" y="45" width="22" height="18" fill="#ffffff" stroke="#c96f52" />
        <rect x="68" y="45" width="22" height="18" fill="#ffffff" stroke="#c96f52" />
        <rect x="102" y="45" width="22" height="18" fill="#ffffff" stroke="#c96f52" />
        <rect x="34" y="70" width="22" height="18" fill="#ffffff" stroke="#c96f52" />
        <rect x="68" y="70" width="22" height="18" fill="#ffffff" stroke="#c96f52" />
        <rect x="102" y="70" width="22" height="18" fill="#ffffff" stroke="#c96f52" />
        <rect x="70" y="88" width="20" height="14" fill="#c96f52" />
        <path d="M18 30L80 10L142 30" fill="#e8b79f" stroke="#c96f52" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "2400 W Wabansia",
    description: "Vintage brick facade with a centered stoop and cornice.",
    svg: (
      <svg viewBox="0 0 160 120" role="img" aria-label="2400 W Wabansia building">
        <rect x="22" y="26" width="116" height="80" rx="6" fill="#fde6bf" stroke="#b9853b" strokeWidth="2" />
        <rect x="42" y="42" width="20" height="16" fill="#ffffff" stroke="#b9853b" />
        <rect x="70" y="42" width="20" height="16" fill="#ffffff" stroke="#b9853b" />
        <rect x="98" y="42" width="20" height="16" fill="#ffffff" stroke="#b9853b" />
        <rect x="42" y="64" width="20" height="16" fill="#ffffff" stroke="#b9853b" />
        <rect x="70" y="64" width="20" height="16" fill="#ffffff" stroke="#b9853b" />
        <rect x="98" y="64" width="20" height="16" fill="#ffffff" stroke="#b9853b" />
        <rect x="72" y="82" width="16" height="24" fill="#b9853b" />
        <rect x="30" y="22" width="100" height="10" fill="#b9853b" />
      </svg>
    ),
  },
  {
    id: "812 W Adams St",
    description: "Converted loft with tall windows and a crisp lintel.",
    svg: (
      <svg viewBox="0 0 160 120" role="img" aria-label="812 W Adams St building">
        <rect x="20" y="18" width="120" height="88" rx="4" fill="#d3e3ff" stroke="#4b6fa9" strokeWidth="2" />
        <rect x="34" y="36" width="24" height="28" fill="#ffffff" stroke="#4b6fa9" />
        <rect x="68" y="36" width="24" height="28" fill="#ffffff" stroke="#4b6fa9" />
        <rect x="102" y="36" width="24" height="28" fill="#ffffff" stroke="#4b6fa9" />
        <rect x="34" y="70" width="24" height="22" fill="#ffffff" stroke="#4b6fa9" />
        <rect x="68" y="70" width="24" height="22" fill="#ffffff" stroke="#4b6fa9" />
        <rect x="102" y="70" width="24" height="22" fill="#ffffff" stroke="#4b6fa9" />
        <rect x="72" y="92" width="16" height="14" fill="#4b6fa9" />
        <rect x="20" y="18" width="120" height="8" fill="#4b6fa9" />
      </svg>
    ),
  },
  {
    id: "159 W North Ave",
    description: "Mid-rise with wide storefront base and side tower.",
    svg: (
      <svg viewBox="0 0 160 120" role="img" aria-label="159 W North Ave building">
        <rect x="24" y="32" width="84" height="74" rx="4" fill="#dff2e1" stroke="#4a8a61" strokeWidth="2" />
        <rect x="110" y="22" width="26" height="84" rx="4" fill="#bfe1c7" stroke="#4a8a61" strokeWidth="2" />
        <rect x="36" y="46" width="18" height="14" fill="#ffffff" stroke="#4a8a61" />
        <rect x="62" y="46" width="18" height="14" fill="#ffffff" stroke="#4a8a61" />
        <rect x="36" y="68" width="18" height="14" fill="#ffffff" stroke="#4a8a61" />
        <rect x="62" y="68" width="18" height="14" fill="#ffffff" stroke="#4a8a61" />
        <rect x="112" y="36" width="22" height="16" fill="#ffffff" stroke="#4a8a61" />
        <rect x="112" y="58" width="22" height="16" fill="#ffffff" stroke="#4a8a61" />
        <rect x="52" y="88" width="24" height="18" fill="#4a8a61" />
      </svg>
    ),
  },
];

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

const NoticeBuilder = () => {
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
  const [currentStep, setCurrentStep] = useState(1);
  const [plainMeaningVisible, setPlainMeaningVisible] = useState(false);
  const [impactCount, setImpactCount] = useState(3);
  const [meTooAdded, setMeTooAdded] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy text");
  const [summaryCopyLabel, setSummaryCopyLabel] = useState("Copy summary");
  const [saveLabel, setSaveLabel] = useState("Save to ledger");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [linkCopyLabel, setLinkCopyLabel] = useState("Copy link");

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
    if (!selectedIssue) {
      return "";
    }

    const template = formState.simpleEnglish
      ? selectedIssue.simple.en
      : selectedIssue.notices[formState.stage]?.[formState.language] ||
        selectedIssue.notices[formState.stage]?.en ||
        selectedIssue.notices.A.en;

    const values: Record<string, string> = {
      ADDRESS: formState.building || "[ADDRESS]",
      UNIT: formState.unit || "[UNIT]",
      ISSUE: formState.issueDescription || "[ISSUE]",
      LOCATION: formState.location || "[LOCATION]",
      "START DATE": formState.startDate || "[START DATE]",
      TODAY: formState.today || "[TODAY]",
      TIME: formState.time || "[TIME]",
      TEMP: formState.temp || "[TEMP]",
      "DATE OF FIRST MESSAGE": formState.firstMessageDate || "[DATE OF FIRST MESSAGE]",
      "YOUR NAME": formState.yourName || "[YOUR NAME]",
      "MOVE-OUT DATE": formState.moveOutDate || "[MOVE-OUT DATE]",
      DATE: formState.eventDate || "[DATE]",
      DATES: formState.eventDates || "[DATES]",
      "DATE/TIME": formState.eventDateTime || "[DATE/TIME]",
      "PHOTO/VIDEO": formState.attachment || "[PHOTO/VIDEO]",
      "ROACHES/RATS/BEDBUGS": formState.pestType || "[ROACHES/RATS/BEDBUGS]",
      "ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM":
        formState.commonArea || "[ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM]",
      "LOCK ME OUT / SHUT OFF UTILITIES":
        formState.lockoutAction || "[LOCK ME OUT / SHUT OFF UTILITIES]",
    };

    if (formState.autoDates) {
      const today = formState.today || formatDate(new Date());
      values["START DATE"] = formState.startDate || today;
      values.TODAY = today;
    }

    return fillTemplate(template, values);
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
        label: "Send an initial notice",
        unlockDay: 0,
        calendarLabel: "Send initial notice",
        detail: "If there is no response, send the first written notice today.",
      },
      {
        label: "Repeat with today's date after a few days",
        unlockDay: 3,
        calendarLabel: "Send follow-up notice",
        detail: "If still unresolved, follow up with today's date and keep the thread.",
      },
      {
        label: "Final notice if still unresolved",
        unlockDay: 6,
        calendarLabel: "Send final notice",
        detail: "If still unresolved, send a final written notice and save your records.",
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
    const issueLabel = selectedIssue?.label || "[ISSUE TYPE]";
    const issueDetails = issueFields
      .map((fieldKey) => {
        const field = fieldDefinitions[fieldKey];
        const value = String(formState[fieldKey as keyof FormState] ?? "").trim();
        if (!field || !value) {
          return null;
        }
        return `- ${field.label}: ${value}`;
      })
      .filter(Boolean);
    const evidence = formState.attachment ? formState.attachment : "None listed";

    return [
      "Building summary export",
      "",
      `Building: ${building}`,
      formState.unit ? `Unit (optional): ${formState.unit}` : "Unit (optional): Not listed",
      `Issue: ${issueLabel}`,
      `Stage: ${stageLabel}`,
      `Start date: ${formState.startDate || "[START DATE]"}`,
      `Report date: ${formState.today || "[TODAY]"}`,
      `Days open: ${daysOpen}`,
      `Residents reporting: ${impactCount}`,
      `Evidence noted: ${evidence}`,
      `Language: ${formState.language.toUpperCase()}`,
      "",
      "Issue details:",
      ...(issueDetails.length > 0 ? issueDetails : ["- Not provided"]),
      "",
      "Notes:",
      "- Generated for inspectors or legal aid.",
      "- Anonymized by default; avoid adding names here.",
    ].join("\n");
  }, [
    formState.attachment,
    formState.building,
    formState.language,
    formState.startDate,
    formState.today,
    formState.unit,
    impactCount,
    issueFields,
    daysOpen,
    selectedIssue?.label,
    stageLabel,
  ]);

  const handleCopy = async () => {
    if (!noticeText) {
      return;
    }
    await navigator.clipboard.writeText(noticeText);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy text"), 1500);
  };

  const handleSummaryCopy = async () => {
    await navigator.clipboard.writeText(exportSummary);
    setSummaryCopyLabel("Copied!");
    setTimeout(() => setSummaryCopyLabel("Copy summary"), 1500);
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
  };

  const handleLedgerSave = async () => {
    if (!formState.building || !formState.issue) {
      setSaveStatus("error");
      setSaveError("Select a building and issue before saving.");
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
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building: formState.building,
          issue: formState.issue,
          stage: formState.stage,
          language: formState.language,
          startDate: formState.startDate,
          reportDate: formState.today,
          reportCount: impactCount,
          simpleEnglish: formState.simpleEnglish,
          issueDetails,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save right now.");
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
    setTimeout(() => setLinkCopyLabel("Copy link"), 1500);
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
  };

  const summaryItems = [
    { label: "Building", value: formState.building || "Select a building" },
    { label: "Issue", value: selectedIssue?.label || "Select an issue" },
    { label: "Stage", value: stageLabel },
    { label: "Language", value: formState.language.toUpperCase() },
    { label: "Start date", value: formState.startDate || "Add a start date" },
    { label: "Today", value: formState.today || "Add today's date" },
    { label: "Plain language", value: formState.simpleEnglish ? "On" : "Off" },
  ];

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

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-main">
          <p className="eyebrow">Tenant support toolkit</p>
          <h1>Tenant Notice Builder</h1>
          <p className="tagline">
            Draft clear, dated messages that keep your documentation strong and easy to share.
          </p>
          <div className="metrics">
            <div>
              <p className="metric-value">24 hrs</p>
              <p className="metric-label">Average response time</p>
            </div>
            <div>
              <p className="metric-value">5 steps</p>
              <p className="metric-label">Typical resolution flow</p>
            </div>
          </div>
          <div className="tag-row">
            <span>Clear paper trail</span>
            <span>Plain-language mode</span>
            <span>Privacy safe</span>
          </div>
        </div>
        <div className="contact-card">
          <p><strong>Maintenance issues SMS:</strong> Ivan (773) 708-2321</p>
          <p><strong>Landlord:</strong> Yelena Bernshtam +1 (773) 678-7636</p>
          <p><strong>Rent issues:</strong> continuumbrokers@yahoo.com</p>
          <p className="contact-note">Use text for urgent safety issues. Email for rent receipts.</p>
        </div>
      </header>

      <main className="layout">
        <div className="flow">
          <section className="panel">
            <div className="step-header">
              <h2>Build your notice</h2>
              <p className="helper">Follow the steps so nothing important is missed.</p>
            </div>
            <div className="step-nav">
              {steps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  className={`step-button ${currentStep === step.id ? "active" : ""}`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <span className="step-title">{step.title}</span>
                  <span className="step-label">{step.label}</span>
                </button>
              ))}
            </div>
            <p className="helper">{steps[currentStep - 1].description}</p>

            <form className="form-grid">
              {currentStep === 1 && (
                <>
                  <div className="building-gallery">
                    <div>
                      <h3>Building gallery</h3>
                      <p className="helper">Select a building card to prefill the address.</p>
                    </div>
                    <div className="building-grid">
                      {buildingOptions.map((building) => (
                        <button
                          key={building.id}
                          type="button"
                          className={`building-card ${formState.building === building.id ? "active" : ""}`}
                          onClick={() => setFormState((prev) => ({ ...prev, building: building.id }))}
                        >
                          <div className="building-illustration">{building.svg}</div>
                          <div>
                            <p className="building-address">{building.id}</p>
                            <p className="building-details">{building.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <label>
                    Building
                    <Select.Root
                      value={formState.building || null}
                      onValueChange={updateSelect("building")}
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
                              {buildingOptions.map((building) => (
                                <Select.Item key={building.id} value={building.id} className="select-item">
                                  <Select.ItemText>{building.id}</Select.ItemText>
                                  <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
                                </Select.Item>
                              ))}
                            </Select.List>
                          </Select.Popup>
                        </Select.Positioner>
                      </Select.Portal>
                    </Select.Root>
                  </label>

                  <label>
                    Unit (optional)
                    <Input className="input" value={formState.unit} onChange={updateField("unit")} placeholder="my unit" />
                  </label>

                  <label>
                    Issue type
                    <Select.Root value={formState.issue || null} onValueChange={updateSelect("issue")} required>
                      <Select.Trigger className="select-trigger" aria-label="Issue type">
                        <Select.Value placeholder="Select issue" />
                        <Select.Icon className="select-icon">
                          <span aria-hidden="true">▾</span>
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner className="select-positioner">
                          <Select.Popup className="select-popup">
                            <Select.List className="select-list">
                              {issueOptions.map((option) => (
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
                  </label>

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
                </>
              )}

              {currentStep === 2 && (
                <>
                  {issueFields.length === 0 && (
                    <p className="helper">Select an issue to reveal the specific details to include.</p>
                  )}
                  {issueFields.map((fieldKey) => {
                    const field = fieldDefinitions[fieldKey];
                    if (!field) {
                      return null;
                    }
                    return (
                      <label key={fieldKey}>
                        {field.label}
                        <Input
                          className="input"
                          type={field.type || "text"}
                          value={String(formState[fieldKey as keyof FormState] ?? "")}
                          onChange={updateField(fieldKey as keyof FormState)}
                          placeholder={field.placeholder}
                        />
                      </label>
                    );
                  })}
                </>
              )}

              {currentStep === 3 && (
                <>
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

                  <label>
                    Your name
                    <Input
                      className="input"
                      value={formState.yourName}
                      onChange={updateField("yourName")}
                      placeholder="[YOUR NAME]"
                    />
                  </label>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <p className="helper">
                    Review the preview, copy the text, and keep a copy for your records. Dates and repetition are the
                    strongest evidence.
                  </p>
                  <div className="review-actions">
                    <Button className="button" type="button" onClick={handleCopy}>
                      {copyLabel}
                    </Button>
                    <Button className="button button-secondary" type="button" onClick={handleReset}>
                      Reset form
                    </Button>
                  </div>
                </>
              )}
            </form>

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
                disabled={currentStep === steps.length}
              >
                Next
              </Button>
            </div>
          </section>

          <section className="panel">
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
                    {meTooAdded
                      ? "Your report is included."
                      : "Add your report or adjust the total."}
                  </p>
                </div>
              </div>
              <div className="impact-actions">
                <Slider.Root
                  className="impact-slider"
                  min={1}
                  max={12}
                  step={1}
                  value={impactCount}
                  onValueChange={(value) => setImpactCount(value as number)}
                >
                  <Slider.Control className="slider-control">
                    <Slider.Track className="slider-track">
                      <Slider.Indicator className="slider-indicator" />
                    </Slider.Track>
                    <Slider.Thumb className="slider-thumb" />
                  </Slider.Control>
                  <Slider.Value className="slider-value" />
                </Slider.Root>
                <Button
                  className={`button ${meTooAdded ? "" : "button-secondary"}`}
                  type="button"
                  onClick={() => {
                    setImpactCount((count) => {
                      if (meTooAdded) {
                        return Math.max(1, count - 1);
                      }
                      return Math.min(12, count + 1);
                    });
                    setMeTooAdded((value) => !value);
                  }}
                >
                  {meTooAdded ? "Remove my report" : "Add my report"}
                </Button>
              </div>
            </div>
          </section>
        </div>

        <aside className="panel panel-highlight preview-panel">
          <div className="output-header">
            <h2>Generated notice</h2>
            <div className="output-actions">
              <Button className="button" type="button" onClick={handleCopy}>
                {copyLabel}
              </Button>
              <Button className="button button-secondary" type="button" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
          <div className="summary-grid">
            {summaryItems.map((item) => (
              <div key={item.label} className="summary-card">
                <p className="summary-label">{item.label}</p>
                <p className="summary-value">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="helper">Preview the message before you send it.</p>
          <pre className="output">{noticeText}</pre>
          <div className="export-block">
            <div className="export-header">
              <div>
                <h3>Building summary export</h3>
                <p className="helper">Use this neutral summary for inspectors or legal aid.</p>
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
            <pre className="output output-summary">{exportSummary}</pre>
            <div className="submission-block">
              <div>
                <h3>Save to the shared ledger</h3>
                <p className="helper">
                  This saves a short summary. It does not include your unit or name.
                </p>
              </div>
              <div className="submission-actions">
                <Button className="button button-secondary" type="button" onClick={handleLedgerSave} disabled={saveStatus === "saving"}>
                  {saveLabel}
                </Button>
                {submissionUrl && (
                  <Button className="button button-secondary" type="button" onClick={handleCopyLink}>
                    {linkCopyLabel}
                  </Button>
                )}
              </div>
              {saveStatus === "saved" && submissionUrl && (
                <p className="submission-note">
                  Saved. Your permalink: <a href={submissionUrl}>{submissionUrl}</a>
                </p>
              )}
              {saveStatus === "error" && (
                <p className="submission-error">{saveError || "We could not save the ledger entry."}</p>
              )}
              {detailSummaryItems.length > 0 && (
                <div className="submission-details">
                  <p className="helper">Details saved:</p>
                  <ul>
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
      </main>

      <footer className="site-footer">
        <p>Safety first: evidence is optional. Public views hide personal details.</p>
      </footer>
    </div>
  );
};

export default NoticeBuilder;
