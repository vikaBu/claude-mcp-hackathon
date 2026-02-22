import type { TimeSlot } from "@/types/meetup";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";

interface PickTimeProps {
  timeSlots: TimeSlot[];
  selectedId: string | null;
  selectedContactIds: string[];
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
  selectedContactIds,
  onSelect,
  onNext,
  onBack,
}: PickTimeProps) {
  const totalContacts = selectedContactIds.length;
  if (timeSlots.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-2xl mb-2">:(</div>
            <p className="retro text-sm text-muted-foreground">
              No overlapping times
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try selecting different contacts
            </p>
          </CardContent>
        </Card>
        <Button onClick={onBack} variant="outline" className="w-full text-xs">
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="retro text-[10px] text-muted-foreground">
        Pick a time that works for everyone
      </p>

      <div className="flex flex-col gap-2">
        {timeSlots.map((slot) => {
          const isSelected = selectedId === slot.id;
          const freeCount = selectedContactIds.filter((id) => slot.availableFor.includes(id)).length;
          const allFree = freeCount === totalContacts;
          return (
            <Card
              key={slot.id}
              font="normal"
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? "!border-primary bg-primary/10"
                  : "hover:!border-muted-foreground"
              }`}
              onClick={() => onSelect(slot.id)}
            >
              <CardContent font="normal" className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      {formatDate(slot.date)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                  </div>
                  <Badge
                    font="retro"
                    className={`text-[8px] ${
                      allFree
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    }`}
                  >
                    {freeCount}/{totalContacts} free
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 text-xs"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedId}
          variant={selectedId ? "default" : "secondary"}
          className="flex-1 text-xs"
        >
          Next: Pick Restaurant
        </Button>
      </div>
    </div>
  );
}
