interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
        <span>Step {currentStep + 1} of {steps.length}</span>
        <span>{steps[currentStep]}</span>
      </div>
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex-1">
            <div
              className={`h-2 rounded-full transition ${
                index <= currentStep ? "bg-brand-600" : "bg-slate-200"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
