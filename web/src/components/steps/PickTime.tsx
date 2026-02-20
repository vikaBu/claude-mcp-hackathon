import type { TimeSlot } from "@/types/meetup";

interface PickTimeProps {
  timeSlots: TimeSlot[];
  selectedId: string | null;
  totalContacts: number;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export function PickTime({
  timeSlots,
  selectedId,
  totalContacts,
  onSelect,
  onNext,
  onBack,
}: PickTimeProps) {
  if (timeSlots.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-center py-8 border-2 border-zinc-700 bg-zinc-800/50">
          <div className="text-2xl mb-2">:(</div>
          <p className="text-sm text-zinc-400 font-heading">
            No overlapping times
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Try selecting different contacts
          </p>
        </div>
        <button
          onClick={onBack}
          className="w-full py-2.5 font-heading text-xs border-2 border-zinc-600 text-zinc-400 hover:border-zinc-500 cursor-pointer transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-400 font-heading">
        Pick a time that works for everyone
      </p>

      <div className="flex flex-col gap-2">
        {timeSlots.map((slot) => {
          const isSelected = selectedId === slot.id;
          return (
            <button
              key={slot.id}
              onClick={() => onSelect(slot.id)}
              className={`
                text-left p-3 border-2 transition-colors cursor-pointer
                ${
                  isSelected
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">
                    {formatDate(slot.date)}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-1 border ${
                    slot.availableFor.length === totalContacts
                      ? "border-green-500/30 bg-green-500/20 text-green-300"
                      : "border-blue-500/30 bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {slot.availableFor.length}/{totalContacts} free
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 py-2.5 font-heading text-xs border-2 border-zinc-600 text-zinc-400 hover:border-zinc-500 cursor-pointer transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedId}
          className={`
            flex-1 py-2.5 font-heading text-xs border-2 transition-colors
            ${
              selectedId
                ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 cursor-pointer"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
            }
          `}
        >
          Next: Pick Restaurant
        </button>
      </div>
    </div>
  );
}
