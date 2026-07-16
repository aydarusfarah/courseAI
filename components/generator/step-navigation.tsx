import { Button } from "../button";

interface StepNavigationProps {
  canProceed: boolean;
  isSubmitting: boolean;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

export function StepNavigation({
  canProceed,
  isSubmitting,
  currentStep,
  totalSteps,
  onBack,
  onNext
}: StepNavigationProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button variant="outline" className="w-full sm:w-auto" onClick={onBack} disabled={currentStep === 0 || isSubmitting}>
        Back
      </Button>
      <Button
        className="w-full sm:w-auto"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
      >
        {currentStep === totalSteps - 1 ? "Generate course" : "Next step"}
      </Button>
    </div>
  );
}
