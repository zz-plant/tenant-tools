import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { type PortfolioId } from "../data/portfolioOptions";

const initialWaitlistState = {
  building: "",
  city: "",
  portfolio: "continuum" as PortfolioId,
};

const WaitlistPanel = () => {
  const [waitlistState, setWaitlistState] = useState(initialWaitlistState);
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [waitlistLabel, setWaitlistLabel] = useState("Join waitlist");
  const [waitlistError, setWaitlistError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [requestCopyLabel, setRequestCopyLabel] = useState("Copy request code");
  const [inviteCopyLabel, setInviteCopyLabel] = useState("Copy invite text");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteText = useMemo(() => {
    const buildingLabel = waitlistState.building || "[ADDRESS]";
    const siteLabel = origin || "this site";
    return [
      "Neighbor note",
      "",
      `I want Building Ledger to support ${buildingLabel}.`,
      "It is a private tool for tracking repairs and notices.",
      `If you want it too, add the building to the waitlist at ${siteLabel}.`,
      "Do not include names or unit numbers.",
    ].join("\n");
  }, [origin, waitlistState.building]);

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
          city: waitlistState.city,
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
    setTimeout(() => setRequestCopyLabel("Copy request code"), 1500);
  };

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(inviteText);
    setInviteCopyLabel("Invite text copied");
    setTimeout(() => setInviteCopyLabel("Copy invite text"), 1500);
  };

  const handleInviteDownload = () => {
    const blob = new Blob([inviteText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeBuilding = (waitlistState.building || "building").toLowerCase().replace(/\s+/g, "-");
    anchor.href = url;
    anchor.download = `${safeBuilding}-neighbor-invite.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleWaitlistReset = () => {
    setWaitlistState(initialWaitlistState);
    setWaitlistStatus("idle");
    setWaitlistLabel("Join waitlist");
    setWaitlistError("");
    setRequestId("");
    setRequestCopyLabel("Copy request code");
    setInviteCopyLabel("Copy invite text");
  };

  return (
    <section className="panel waitlist-panel">
      <div className="waitlist-header">
        <div>
          <h2>Building not listed?</h2>
          <p className="helper">
            Add your building to the waitlist. We do not collect names, emails, or phone numbers.
          </p>
        </div>
      </div>
      <div className="waitlist-grid">
        <form className="waitlist-form" onSubmit={handleWaitlistSubmit}>
          <label>
            Building address
            <Input
              className="input"
              value={waitlistState.building}
              onChange={handleWaitlistChange("building")}
              placeholder="123 Main St"
              required
            />
          </label>
          <p className="helper">Do not include unit numbers or resident names.</p>
          <label>
            City (optional)
            <Input
              className="input"
              value={waitlistState.city}
              onChange={handleWaitlistChange("city")}
              placeholder="City"
            />
          </label>
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
              <p className="helper">Saved. Keep this request code so you can check back later.</p>
              <div className="waitlist-actions">
                <span className="waitlist-code">{requestId}</span>
                <Button className="button button-secondary" type="button" onClick={handleCopyRequestId}>
                  {requestCopyLabel}
                </Button>
              </div>
            </div>
          )}
          {waitlistStatus === "error" && <p className="submission-error">{waitlistError}</p>}
        </form>
        <div className="waitlist-invite">
          <h3>Invite neighbors</h3>
          <p className="helper">
            This tool does not send messages between residents. Use this neutral invite to talk in person or share a
            printed note.
          </p>
          <pre className="output output-summary">{inviteText}</pre>
          <div className="waitlist-actions">
            <Button className="button button-secondary" type="button" onClick={handleCopyInvite}>
              {inviteCopyLabel}
            </Button>
            <Button className="button button-secondary" type="button" onClick={handleInviteDownload}>
              Download invite
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistPanel;
