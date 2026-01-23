import React, { useMemo, useState } from "react";
import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { issueOptions, meaningMap } from "../data/noticeData";

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

type FormState = typeof initialState;

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const getCurrentTime = (date: Date) =>
  `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

const fillTemplate = (template: string, values: Record<string, string>) => {
  let text = template;
  Object.entries(values).forEach(([key, value]) => {
    text = text.replaceAll(`[${key}]`, value);
  });
  return text;
};

const getDefaultState = (): FormState => {
  const now = new Date();
  const formatted = formatDate(now);
  return {
    ...initialState,
    today: formatted,
    startDate: formatted,
    time: getCurrentTime(now),
  };
};

const issueFieldMap: Record<string, string[]> = {
  heat: ["temp", "time", "startDate"],
  leak: ["location", "attachment", "startDate"],
  pests: ["pestType", "startDate"],
  entry: ["eventDate", "eventDates", "firstMessageDate"],
  common: ["commonArea", "startDate"],
  "no-timeline": ["startDate"],
  deposit: ["moveOutDate"],
  lockout: ["lockoutAction", "eventDate", "eventDateTime"],
  building: ["issueDescription", "startDate", "firstMessageDate"],
};

const NoticeBuilder = () => {
  const [formState, setFormState] = useState<FormState>(getDefaultState);
  const [plainMeaningVisible, setPlainMeaningVisible] = useState(true);
  const [impactCount, setImpactCount] = useState(3);
  const [copyLabel, setCopyLabel] = useState("Copy text");

  const updateField = (key: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = event.target as HTMLInputElement;
      const nextValue = target.type === "checkbox" ? target.checked : target.value;
      setFormState((prev) => {
        const nextState = {
          ...prev,
          [key]: nextValue,
        } as FormState;

        if (key === "autoDates" && nextValue === true) {
          const now = new Date();
          const formatted = formatDate(now);
          nextState.today = formatted;
          if (!prev.startDate) {
            nextState.startDate = formatted;
          }
          nextState.time = getCurrentTime(now);
        }

        return nextState;
      });
    };

  const selectedIssue = issueOptions.find((option) => option.id === formState.issue);
  const visibleIssueFields = issueFieldMap[formState.issue] ?? [];

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

  const nextSteps = useMemo(() => {
    const startDate = formState.startDate ? new Date(formState.startDate) : null;
    const today = formState.today ? new Date(formState.today) : new Date();
    const daysOpen = startDate
      ? Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return [
      { label: "Send an initial notice", unlockDay: 0 },
      { label: "Repeat with today's date after a few days", unlockDay: 3 },
      { label: "Final notice if still unresolved", unlockDay: 6 },
    ].map((step) => ({
      ...step,
      unlocked: daysOpen >= step.unlockDay,
      remaining: step.unlockDay - daysOpen,
    }));
  }, [formState.startDate, formState.today]);

  const handleCopy = async () => {
    if (!noticeText) {
      return;
    }
    await navigator.clipboard.writeText(noticeText);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy text"), 1500);
  };

  const handleReset = () => {
    setFormState(getDefaultState());
    setPlainMeaningVisible(true);
    setImpactCount(3);
    setCopyLabel("Copy text");
  };

  const summaryItems = [
    { label: "Building", value: formState.building || "Select a building" },
    { label: "Issue", value: selectedIssue?.label || "Choose an issue" },
    { label: "Stage", value: formState.stage },
    { label: "Language", value: formState.language.toUpperCase() },
  ];

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-main">
          <p className="eyebrow">Tenant support toolkit</p>
          <h1>Tenant Notice Builder</h1>
          <p className="tagline">
            Draft clear, dated messages with confident next steps so you stay informed and organized.
          </p>
          <div className="tag-row">
            <span>Evidence-ready</span>
            <span>Plain-language mode</span>
            <span>Privacy safe</span>
            <span>Guided timeline</span>
          </div>
        </div>
        <div className="contact-card">
          <p><strong>Maintenance issues SMS:</strong> Ivan (773) 708-2321</p>
          <p><strong>Landlord:</strong> Yelena Bernshtam +1 (773) 678-7636</p>
          <p><strong>Rent issues:</strong> continuumbrokers@yahoo.com</p>
          <p className="contact-note">Use text for urgent safety issues. Email for rent receipts.</p>
        </div>
      </header>

      <main className="shell">
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2>Set the basics</h2>
            </div>
            <p className="helper">Required fields are marked. Everything else is optional.</p>
          </div>

          <div className="form-grid">
            <label>
              Building <span className="required">*</span>
              <select
                value={formState.building}
                onChange={updateField("building")}
                required
                className="select"
              >
                <option value="">Select building</option>
                <option>2353 W Wabansia</option>
                <option>2400 W Wabansia</option>
                <option>812 W Adams St</option>
                <option>159 W North Ave</option>
              </select>
            </label>

            <label>
              Unit (optional)
              <Input
                className="input"
                value={formState.unit}
                onChange={updateField("unit")}
                placeholder="e.g. 3B"
              />
            </label>

            <label>
              Issue type <span className="required">*</span>
              <select
                value={formState.issue}
                onChange={updateField("issue")}
                required
                className="select"
              >
                <option value="">Select issue</option>
                {issueOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Notice stage
              <select
                value={formState.stage}
                onChange={updateField("stage")}
                required
                className="select"
              >
                <option value="A">A. Initial notice</option>
                <option value="B">B. Follow-up</option>
                <option value="C">C. Final notice</option>
              </select>
            </label>

            <label>
              Language
              <select
                value={formState.language}
                onChange={updateField("language")}
                required
                className="select"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="hi">हिंदी</option>
                <option value="pl">Polski</option>
              </select>
            </label>

            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formState.simpleEnglish}
                  onChange={updateField("simpleEnglish")}
                />
                Use very simple English
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={formState.autoDates} onChange={updateField("autoDates")} />
                Auto-fill today & start date
              </label>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>Timeline details</h2>
            </div>
            <p className="helper">Only add what you know. You can always follow up later.</p>
          </div>

          <div className="form-grid">
            <label>
              Start date
              <Input
                className="input"
                type="date"
                value={formState.startDate}
                onChange={updateField("startDate")}
                disabled={formState.autoDates}
              />
            </label>

            <label>
              Date of first message (for follow-ups)
              <Input
                className="input"
                type="date"
                value={formState.firstMessageDate}
                onChange={updateField("firstMessageDate")}
              />
            </label>

            <div className="inline-fields">
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
                Time
                <Input
                  className="input"
                  type="time"
                  value={formState.time}
                  onChange={updateField("time")}
                />
              </label>
              <label>
                Temp (°F)
                <Input
                  className="input"
                  type="number"
                  value={formState.temp}
                  onChange={updateField("temp")}
                  placeholder="68"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Step 3</p>
              <h2>Issue-specific details</h2>
            </div>
            <p className="helper">These fields appear based on the issue you select.</p>
          </div>

          {!formState.issue && (
            <div className="empty-state">
              Choose an issue above to see the extra details that apply.
            </div>
          )}

          {formState.issue && (
            <div className="form-grid">
              {visibleIssueFields.includes("location") && (
                <label>
                  Location (for leaks)
                  <Input
                    className="input"
                    value={formState.location}
                    onChange={updateField("location")}
                    placeholder="kitchen ceiling"
                  />
                </label>
              )}

              {visibleIssueFields.includes("attachment") && (
                <label>
                  Optional attachment label
                  <Input
                    className="input"
                    value={formState.attachment}
                    onChange={updateField("attachment")}
                    placeholder="photo/video"
                  />
                </label>
              )}

              {visibleIssueFields.includes("pestType") && (
                <label>
                  Pest type
                  <Input
                    className="input"
                    value={formState.pestType}
                    onChange={updateField("pestType")}
                    placeholder="roaches / rats / bedbugs"
                  />
                </label>
              )}

              {visibleIssueFields.includes("commonArea") && (
                <label>
                  Common area item
                  <Input
                    className="input"
                    value={formState.commonArea}
                    onChange={updateField("commonArea")}
                    placeholder="elevator or hall lights"
                  />
                </label>
              )}

              {visibleIssueFields.includes("lockoutAction") && (
                <label>
                  Lockout or shutoff action
                  <Input
                    className="input"
                    value={formState.lockoutAction}
                    onChange={updateField("lockoutAction")}
                    placeholder="lock me out / shut off utilities"
                  />
                </label>
              )}

              {visibleIssueFields.includes("eventDate") && (
                <label>
                  Event date (entry/lockout)
                  <Input
                    className="input"
                    type="date"
                    value={formState.eventDate}
                    onChange={updateField("eventDate")}
                  />
                </label>
              )}

              {visibleIssueFields.includes("eventDates") && (
                <label>
                  Multiple event dates
                  <Input
                    className="input"
                    value={formState.eventDates}
                    onChange={updateField("eventDates")}
                    placeholder="e.g. May 3, May 7"
                  />
                </label>
              )}

              {visibleIssueFields.includes("eventDateTime") && (
                <label>
                  Event date/time (utilities)
                  <Input
                    className="input"
                    value={formState.eventDateTime}
                    onChange={updateField("eventDateTime")}
                    placeholder="May 12 at 9:00 AM"
                  />
                </label>
              )}

              {visibleIssueFields.includes("moveOutDate") && (
                <label>
                  Move-out date
                  <Input
                    className="input"
                    type="date"
                    value={formState.moveOutDate}
                    onChange={updateField("moveOutDate")}
                  />
                </label>
              )}

              {visibleIssueFields.includes("issueDescription") && (
                <label>
                  Issue description (building-wide)
                  <Input
                    className="input"
                    value={formState.issueDescription}
                    onChange={updateField("issueDescription")}
                    placeholder="broken elevator"
                  />
                </label>
              )}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Step 4</p>
              <h2>Your information</h2>
            </div>
            <p className="helper">We only use this to sign the notice.</p>
          </div>

          <label>
            Your name
            <Input
              className="input"
              value={formState.yourName}
              onChange={updateField("yourName")}
              placeholder="[YOUR NAME]"
            />
          </label>

          <p className="helper">
            Tip: Keep emotions out and focus on dates, facts, and the response you need.
          </p>
        </section>

        <section className="panel panel-highlight sticky">
          <div className="section-header">
            <div>
              <p className="eyebrow">Preview</p>
              <h2>Review and send</h2>
            </div>
            <div className="notice-actions">
              <Button className="button" type="button" onClick={handleCopy} disabled={!noticeText}>
                {copyLabel}
              </Button>
              <Button className="button button-ghost" type="button" onClick={handleReset}>
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
          {noticeText ? (
            <pre className="output">{noticeText}</pre>
          ) : (
            <div className="empty-state">Select an issue to generate your notice.</div>
          )}

          <div className="plain-meaning">
            <div className="plain-meaning-header">
              <h3>Plain meaning</h3>
              <Button
                className="button button-secondary"
                type="button"
                onClick={() => setPlainMeaningVisible((prev) => !prev)}
              >
                {plainMeaningVisible ? "Hide" : "Show"}
              </Button>
            </div>
            {plainMeaningVisible && (
              <ul className="meaning-list">
                {meaningItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel-subsection">
            <h3>What usually happens next</h3>
            <p className="helper">Based on how long the issue has been open.</p>
            <ul className="next-steps">
              {nextSteps.map((step) => (
                <li key={step.label} className={step.unlocked ? "" : "locked"}>
                  <span>{step.label}</span>
                  {!step.unlocked && (
                    <span className="badge">Unlock in {Math.abs(step.remaining)} days</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="impact">
            <div>
              <p className="summary-label">Community impact</p>
              <p className="summary-value">
                <span>{impactCount}</span> residents reported this issue.
              </p>
            </div>
            <Button
              className="button button-secondary"
              type="button"
              onClick={() => setImpactCount((count) => count + 1)}
            >
              Me too
            </Button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Safety first: evidence is optional. Public views hide personal details.</p>
      </footer>
    </div>
  );
};

export default NoticeBuilder;
