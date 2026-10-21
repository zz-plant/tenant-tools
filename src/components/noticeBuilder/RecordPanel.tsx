import { useState } from "react";
import { Button } from "../ui";
import { formatTimelineDate } from "../../lib/dateUtils";
import type { SubmissionTimelineEntry } from "../../lib/submissionTimeline";
import type { RuleCard } from "../../data/rules";
import { helpResourceGroups, toTelHref } from "../../data/helpResources";
import type { NextStep } from "./logic";

type RecordPanelProps = {
  canShowAfterBasics: boolean;
  /** Phones show this panel only on the last step, so the steps above stay short. */
  hideOnPhone?: boolean;
  onGoToStep1: () => void;
  timelineEntries: SubmissionTimelineEntry[];
  visibleNextSteps: NextStep[];
  impactCount: number;
  issueGuidance: { category: string; nextStep: string } | null;
  guidanceScript: string;
  ruleCards: RuleCard[];
};

/** "Record and next steps": timeline, unlockable next steps, report count, and public info links. */
const RecordPanel = ({
  canShowAfterBasics,
  hideOnPhone = false,
  onGoToStep1,
  timelineEntries,
  visibleNextSteps,
  impactCount,
  issueGuidance,
  guidanceScript,
  ruleCards,
}: RecordPanelProps) => {
  const [scriptCopyLabel, setScriptCopyLabel] = useState("Copy 311 script");

  return (
    <section className={`panel panel-highlight record-panel${!canShowAfterBasics || hideOnPhone ? " record-panel-mobile-hidden" : ""}`} id="record">
    <div>
      <h2>Record and next steps</h2>
      <p className="helper">What comes after you send the notice. Nothing here is sent or saved by itself.</p>
    </div>
    {!canShowAfterBasics ? (
      <div className="record-locked">
        <p className="helper"><strong>Locked:</strong> finish step 1 to unlock this section.</p>
        <Button className="button button-secondary" type="button" onClick={onGoToStep1}>
          Go to step 1
        </Button>
      </div>
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
            {visibleNextSteps.map((step) => (
              <li key={step.label} className={step.unlocked ? "" : "locked"}>
                <div className="next-step-row">
                  <div>
                    <p className="next-step-title">{step.label}</p>
                    <p className="helper">
                      {!step.reminderDate
                        ? "Add the date the problem started to see when this opens."
                        : step.unlocked
                          ? "You can do this now."
                          : `Opens on ${formatTimelineDate(step.reminderDate)}, in ${step.remaining} day${step.remaining === 1 ? "" : "s"}. If the problem is fixed by then, you do not need it.`}
                    </p>
                  </div>
                  {!step.unlocked && step.calendarLink && (
                    <a className="button button-secondary calendar-link" href={step.calendarLink} target="_blank" rel="noreferrer">
                      Remind me in Google Calendar
                    </a>
                  )}
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
                <p className="impact-label">{impactCount === 1 ? "Household reporting" : "Households reporting"}</p>
                <p className="impact-hint">This counts you. After you save, neighbors with the same problem can tap “Me too” on the record.</p>
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
                <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <a className="button button-compact" href="tel:311">
                    Call 311
                  </a>
                  <Button
                    className="button button-secondary button-compact"
                    type="button"
                    onClick={async () => {
                      if (guidanceScript) {
                        await navigator.clipboard.writeText(guidanceScript);
                        setScriptCopyLabel("Copied script ✓");
                        setTimeout(() => setScriptCopyLabel("Copy 311 script"), 2000);
                      }
                    }}
                  >
                    {scriptCopyLabel}
                  </Button>
                  <a
                    className="button button-secondary button-compact"
                    href="https://311.chicago.gov"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open 311.chicago.gov ↗
                  </a>
                </div>
              </div>
            </details>
          )}

          {ruleCards.length > 0 && (
            <details className="helper-card">
              <summary>Local rules (information only)</summary>
              <div className="helper-card-body">
                <ul className="rule-cards">
                  {ruleCards.map((card) => (
                    <li key={card.id} className="rule-card">
                      <h4>{card.title}</h4>
                      {card.section && <p className="rule-meta">{card.section}</p>}
                      <p>{card.summary}</p>
                      {card.details && (
                        <ul className="rule-details">
                          {card.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      )}
                      {card.upcoming && (
                        <div className="rule-upcoming">
                          <p>
                            <strong>Starting {formatTimelineDate(card.upcoming.startDate)}:</strong>{" "}
                            {card.upcoming.summary}
                          </p>
                          {card.upcoming.details && (
                            <ul className="rule-details">
                              {card.upcoming.details.map((detail) => (
                                <li key={detail}>{detail}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      <ul className="rule-sources">
                        {card.sources.map((source) => (
                          <li key={source.url}>
                            <a href={source.url} target="_blank" rel="noreferrer">
                              {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                      <p className="rule-meta">Last checked: {formatTimelineDate(card.lastReviewed)}</p>
                    </li>
                  ))}
                </ul>
                <p>
                  <a href="/rights" target="_blank" rel="noreferrer">
                    Printable short guide to Chicago tenant rules
                  </a>
                </p>
              </div>
            </details>
          )}

          <details className="helper-card">
            <summary>Where to get help</summary>
            <div className="helper-card-body help-resources">
              <p>Tenant Tools does not share your data with these groups.</p>
              {helpResourceGroups.map((group) => (
                <div key={group.id} className="help-group">
                  <h4>{group.title}</h4>
                  {group.note && <p>{group.note}</p>}
                  <ul className="help-list">
                    {group.items.map((item) => (
                      <li key={item.url}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.name}
                        </a>
                        {item.phone && (
                          <>
                            {" · "}
                            <a href={toTelHref(item.phone)}>{item.phone}</a>
                          </>
                        )}
                        <span className="help-description">{item.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </div>
      </>
    )}
  </section>
);
};

export default RecordPanel;
