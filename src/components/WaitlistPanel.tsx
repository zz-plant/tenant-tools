import React, { useState } from "react";
import { Button, Input } from "./ui";
import { type PortfolioId } from "../data/portfolioOptions";
import { waitlistBuildingLimit } from "../lib/waitlist";
import useTimedCallbacks from "../hooks/useTimedCallbacks";

const initialWaitlistState = {
  building: "",
  portfolio: "continuum" as PortfolioId,
};

const WaitlistPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [waitlistState, setWaitlistState] = useState(initialWaitlistState);
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [waitlistLabel, setWaitlistLabel] = useState("Join waitlist");
  const [waitlistError, setWaitlistError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [requestCopyLabel, setRequestCopyLabel] = useState("Copy request code");
  const buildingHelperId = "waitlist-building-helper";
  const { scheduleTimeout } = useTimedCallbacks();

  const handleWaitlistChange =
    (key: keyof typeof initialWaitlistState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget;
      setWaitlistState((prev) => ({ ...prev, [key]: value }));
    };

  const handleWaitlistSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWaitlistError("");

    if (!waitlistState.building.trim()) {
      setWaitlistStatus("error");
      setWaitlistError("Add a building address before saving.");
      return;
    }

    setWaitlistStatus("saving");
    setWaitlistLabel("Saving...");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building: waitlistState.building,
          portfolio: waitlistState.portfolio,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save the waitlist request.");
      }
      setRequestId(payload?.id || "");
      setWaitlistStatus("saved");
      setWaitlistLabel("Saved");
    } catch (error) {
      setWaitlistStatus("error");
      setWaitlistLabel("Join waitlist");
      setWaitlistError(error instanceof Error ? error.message : "We could not save the waitlist request.");
    }
  };

  const handleCopyRequestId = async () => {
    if (!requestId) {
      return;
    }
    await navigator.clipboard.writeText(requestId);
    setRequestCopyLabel("Request code copied");
    scheduleTimeout("request-copy-label", () => setRequestCopyLabel("Copy request code"), 1500);
  };

  const handleWaitlistReset = () => {
    setWaitlistState(initialWaitlistState);
    setWaitlistStatus("idle");
    setWaitlistLabel("Join waitlist");
    setWaitlistError("");
    setRequestId("");
    setRequestCopyLabel("Copy request code");
  };

  return (
    <section className="panel waitlist-panel" id="waitlist">
      <div className="waitlist-header">
        <div>
          <h2>Building not listed?</h2>
          <p className="helper">
            Add your building to the waitlist. No names, emails, or phone numbers.
          </p>
          {!isExpanded && (
            <p className="helper">Step 1: add address. Step 2: save request code.</p>
          )}
        </div>
        <Button className="button button-secondary" type="button" onClick={() => setIsExpanded((prev) => !prev)}>
          {isExpanded ? "Hide waitlist steps" : "Start waitlist"}
        </Button>
      </div>
      {isExpanded && (
        <div className="waitlist-grid">
          <form className="waitlist-form" onSubmit={handleWaitlistSubmit}>
            <h3>Step 1: Add the building</h3>
            <label>
              Building address
              <Input
                className="input"
                value={waitlistState.building}
                onChange={handleWaitlistChange("building")}
                placeholder="123 Main St"
                maxLength={waitlistBuildingLimit}
                autoComplete="street-address"
                aria-describedby={buildingHelperId}
                required
              />
            </label>
            <p className="helper" id={buildingHelperId}>
              No unit numbers or resident names.
            </p>
            <div className="waitlist-actions">
              <Button className="button" type="submit" disabled={waitlistStatus === "saving"}>
                {waitlistLabel}
              </Button>
              <Button className="button button-secondary" type="button" onClick={handleWaitlistReset}>
                Clear
              </Button>
            </div>
            {waitlistStatus === "saved" && requestId && (
              <div className="waitlist-success">
                <h3>Step 2: Save your request code</h3>
                <p className="helper" role="status" aria-live="polite">Saved. Your request code is below.</p>
                <div className="waitlist-actions">
                  <span className="waitlist-code">{requestId}</span>
                  <Button className="button button-secondary" type="button" onClick={handleCopyRequestId}>
                    {requestCopyLabel}
                  </Button>
                </div>
              </div>
            )}
            {waitlistStatus === "error" && (
              <p className="submission-error" role="alert">
                {waitlistError}
              </p>
            )}
          </form>
          {waitlistStatus === "saved" && requestId && (
            <div className="waitlist-success" role="status" aria-live="polite">
              <h3>Done</h3>
              <p className="helper">Please save this code now. You need it for follow-up.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default WaitlistPanel;
