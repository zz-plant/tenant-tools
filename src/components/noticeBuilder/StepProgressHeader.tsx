type StepProgressHeaderProps = {
  currentStep: number;
  totalSteps: number;
  stepProgress: number;
  currentStepLabel: string;
};

const StepProgressHeader = ({ currentStep, totalSteps, stepProgress, currentStepLabel }: StepProgressHeaderProps) => (
  <div className="step-header">
    <h2>Write a notice</h2>
    <div className="step-meta">
      <div className="step-progress">
        <div className="step-progress-row">
          <p className="step-progress-label">Step {currentStep} of {totalSteps}: {currentStepLabel}</p>
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
