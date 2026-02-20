import type { MeetupStep } from "@/types/meetup";

const STEPS: { key: MeetupStep; label: string }[] = [
  { key: "contacts", label: "Who" },
  { key: "time", label: "When" },
  { key: "restaurant", label: "Where" },
  { key: "confirm", label: "Send" },
];

const stepIndex = (step: MeetupStep) => STEPS.findIndex((s) => s.key === step);

export function StepProgress({ currentStep }: { currentStep: MeetupStep }) {
  const current = stepIndex(currentStep);

  return (
    <div className="flex items-center justify-between gap-1 mb-4 px-1">
      {STEPS.map((step, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;

        return (
          <div key={step.key} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`
                  w-8 h-8 flex items-center justify-center text-xs font-bold
                  border-2
                  ${
                    isCompleted
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : isCurrent
                        ? "border-yellow-400 bg-yellow-400/20 text-yellow-300"
                        : "border-zinc-600 bg-zinc-800/50 text-zinc-500"
                  }
                `}
              >
                {isCompleted ? "+" : i + 1}
              </div>
              <span
                className={`text-[10px] font-heading leading-none ${
                  isCurrent
                    ? "text-yellow-300"
                    : isCompleted
                      ? "text-green-400"
                      : "text-zinc-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mt-[-14px] ${
                  i < current ? "bg-green-500/50" : "bg-zinc-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
