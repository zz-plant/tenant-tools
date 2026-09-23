import { Button } from "../ui";
import { formatTimelineDate } from "../../lib/dateUtils";
import type { SubmissionTimelineEntry } from "../../lib/submissionTimeline";
import type { NextStep } from "./logic";

type RecordPanelProps = {
  canShowAfterBasics: boolean;
  onGoToStep1: () => void;
  timelineEntries: SubmissionTimelineEntry[];
  visibleNextSteps: NextStep[];
  daysOpen: number;
  impactCount: number;
  issueGuidance: { category: string; nextStep: string } | null;
  guidanceScript: string;
  ruleSources: Array<{ url: string; title: string }>;
};

/** "Record and next steps": timeline, unlockable next steps, report count, and public info links. */
const RecordPanel = ({
  canShowAfterBasics,
  onGoToStep1,
  timelineEntries,
  visibleNextSteps,
  daysOpen,
  impactCount,
  issueGuidance,
  guidanceScript,
  ruleSources,
}: RecordPanelProps) => (
  <section className={`panel panel-highlight record-panel${!canShowAfterBasics ? " record-panel-mobile-hidden" : ""}`} id="record">
    <div>
      <h2>Record and next steps</h2>
      <p className="helper">Use this after you send the notice.</p>
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
                    <p className="next-step-title">
                      {step.unlocked
                        ? step.label
                        : `${step.label} (next normal step unlocks in ${Math.abs(step.remaining)} days)`}
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
);

export default RecordPanel;
