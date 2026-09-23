
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
    <h1>Build your notice</h1>
    <div className="step-meta">
      <div className="step-progress">
        <div className="step-progress-row">
          <p className="step-progress-label">Step {currentStep} of {totalSteps}</p>
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
      <div className="step-privacy">
        {!stepsLocked && <p className="helper step-now">Now: {currentStepLabel}</p>}
      </div>
    </div>
  </div>
);

export default StepProgressHeader;
