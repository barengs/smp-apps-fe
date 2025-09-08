import React from 'react';
import { cn } from '@/lib/utils';

interface FormStepIndicatorProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

const FormStepIndicator: React.FC<FormStepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between space-x-2 mb-6">
      {steps.map((stepName, index) => (
        <div key={stepName} className="flex-1 flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              index === currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
              index < currentStep && "bg-green-500 text-white" // Optional: highlight completed steps
            )}
          >
            {index + 1}
          </div>
          <span
            className={cn(
              "ml-2 text-sm font-medium",
              index === currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            {stepName}
          </span>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2",
                index < currentStep ? "bg-green-500" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FormStepIndicator;