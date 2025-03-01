
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ProgressStep = {
  id: number;
  label: string;
};

interface ProgressStepsProps {
  steps: ProgressStep[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="relative mx-auto mb-10 w-full max-w-2xl">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={cn(
                "progress-step",
                currentStep === step.id && "active",
                currentStep > step.id && "completed"
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-4 w-4" />
              ) : (
                step.id
              )}
            </div>
            <span className="mt-2 text-xs font-medium">{step.label}</span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "progress-line",
                  currentStep > index && "active"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
