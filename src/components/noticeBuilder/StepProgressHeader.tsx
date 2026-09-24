type StepProgressHeaderProps = {
  currentStep: number;
  totalSteps: number;
  stepProgress: number;
  progressPillLabel: string;
  stepsLocked: boolean;
  currentStepLabel: string;
};

const StepProgressHeader = ({
  currentStep,
  totalSteps,
  stepProgress,
  progressPillLabel,
  stepsLocked,
  currentStepLabel,
}: StepProgressHeaderProps) => (
  <div className="step-header">
    <div className="step-header-title-row">
      <h1>Build your notice</h1>
      {!stepsLocked && (
        <span className="step-now-badge">
          Current: {currentStepLabel}
        </span>
      )}
    </div>
    <div className="step-meta">
      <div className="step-progress">
        <div className="step-progress-row">
          <p className="step-progress-label">Step {currentStep} of {totalSteps}: {currentStepLabel}</p>
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
    </div>
  </div>
);

export default StepProgressHeader;
