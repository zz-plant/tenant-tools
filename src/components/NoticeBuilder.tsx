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

const formatDate = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

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
  const [plainMeaningVisible, setPlainMeaningVisible] = useState(false);
  const [impactCount, setImpactCount] = useState(3);
  const [copyLabel, setCopyLabel] = useState("Copy text");

  const updateField = (key: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = event.target as HTMLInputElement;
      setFormState((prev) => ({
        ...prev,
        [key]: target.type === "checkbox" ? target.checked : target.value,
      }));
    };

  const selectedIssue = issueOptions.find((option) => option.id === formState.issue);

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
        <section className="panel">
          <h2>Start your notice</h2>
          <form className="form-grid">
            <label>
              Building
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
              <Input className="input" value={formState.unit} onChange={updateField("unit")} placeholder="my unit" />
            </label>

            <label>
              Issue type
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
                Very simple English
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={formState.autoDates} onChange={updateField("autoDates")} />
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

            <label>
              Event date (entry/lockout)
              <Input
                className="input"
                type="date"
                value={formState.eventDate}
                onChange={updateField("eventDate")}
              />
            </label>

            <label>
              Event date(s) (multiple entries)
              <Input
                className="input"
                value={formState.eventDates}
                onChange={updateField("eventDates")}
                placeholder="[DATES]"
              />
            </label>

            <label>
              Event date/time (utilities)
              <Input
                className="input"
                value={formState.eventDateTime}
                onChange={updateField("eventDateTime")}
                placeholder="[DATE/TIME]"
              />
            </label>

            <label>
              Move-out date (deposit)
              <Input
                className="input"
                type="date"
                value={formState.moveOutDate}
                onChange={updateField("moveOutDate")}
              />
            </label>

            <label>
              Pest type (roaches/rats/bedbugs)
              <Input
                className="input"
                value={formState.pestType}
                onChange={updateField("pestType")}
                placeholder="ROACHES"
              />
            </label>

            <label>
              Common area item
              <Input
                className="input"
                value={formState.commonArea}
                onChange={updateField("commonArea")}
                placeholder="ELEVATOR"
              />
            </label>

            <label>
              Lockout or shutoff action
              <Input
                className="input"
                value={formState.lockoutAction}
                onChange={updateField("lockoutAction")}
                placeholder="LOCK ME OUT"
              />
            </label>

            <label>
              Location (for leak entries)
              <Input
                className="input"
                value={formState.location}
                onChange={updateField("location")}
                placeholder="kitchen ceiling"
              />
            </label>

            <label>
              Issue description (for building-wide message)
              <Input
                className="input"
                value={formState.issueDescription}
                onChange={updateField("issueDescription")}
                placeholder="broken elevator"
              />
            </label>

            <label>
              Optional attachment label
              <Input
                className="input"
                value={formState.attachment}
                onChange={updateField("attachment")}
                placeholder="photo/video"
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

            <p className="helper">
              You do not need to explain how you feel. Dates and repetition work better than emotion.
            </p>
          </form>
        </section>

        <section className="panel panel-highlight">
          <div className="output-header">
            <h2>Generated notice</h2>
            <Button className="button" type="button" onClick={handleCopy}>
              {copyLabel}
            </Button>
          </div>
          <p className="helper">Preview the message before you send it.</p>
          <pre className="output">{noticeText}</pre>
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

        <section className="panel">
          <h2>What usually happens next</h2>
          <p className="helper">This shows the normal next step based on how long the issue has been open.</p>
          <ul className="next-steps">
            {nextSteps.map((step) => (
              <li key={step.label} className={step.unlocked ? "" : "locked"}>
                {step.unlocked
                  ? step.label
                  : `${step.label} (unlock in ${Math.abs(step.remaining)} days)`}
              </li>
            ))}
          </ul>

          <h3>Community impact</h3>
          <div className="impact">
            <div>
              <span>{impactCount}</span> residents reported this issue.
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
