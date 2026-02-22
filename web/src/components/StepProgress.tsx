import type { MeetupStep } from "@/types/meetup";
import { Progress } from "@/components/ui/8bit/progress";
import "@/components/ui/8bit/styles/retro.css";

const STEPS: { key: MeetupStep; label: string }[] = [
  { key: "contacts", label: "Who" },
  { key: "time", label: "When" },
  { key: "restaurant", label: "Where" },
  { key: "confirm", label: "Send" },
];

const stepIndex = (step: MeetupStep) => STEPS.findIndex((s) => s.key === step);

export function StepProgress({ currentStep }: { currentStep: MeetupStep }) {
  const current = stepIndex(currentStep);
  const progressValue = (current / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2 px-1">
        {STEPS.map((step, i) => {
          const isCompleted = i < current;
          const isCurrent = i === current;

          return (
            <span
              key={step.key}
              className={`retro text-[8px] ${
                isCurrent
                  ? "text-primary"
                  : isCompleted
                    ? "text-green-400"
                    : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          );
        })}
      </div>
      <Progress
        value={progressValue}
        variant="retro"
        className="h-3"
        progressBg="bg-primary"
      />
    </div>
  );
}
