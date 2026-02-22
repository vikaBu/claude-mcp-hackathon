import { useState } from "react";
import type { WorkVenue, WorkVenueType } from "@/types/meetup";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";

interface PickVenueProps {
  venues: WorkVenue[];
  selectedId: WorkVenueType | null;
  onSelect: (id: WorkVenueType) => void;
  onNext: () => void;
  onBack: () => void;
}

const ERRORS = [
  "ERROR: Invalid selection. Please reconsider.",
  "ERROR: Are you sure about that?",
  "ERROR: That doesn't sound like a pub.",
  "ERROR: System recommends the pub.",
  "ERROR: Nice try. Pick again.",
  "ERROR: Pub not detected. Try harder.",
];

const SUCCESS = [
  "EXCELLENT CHOICE. Pub protocol activated.",
  "Now we're talking. Pints incoming.",
  "Finally, someone with taste.",
  "Correct. Loading pub vibes...",
  "Achievement unlocked: Good Decision Maker.",
  "The system approves. See you at the bar.",
];

export function PickVenue({
  venues,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: PickVenueProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSelect = (id: WorkVenueType) => {
    if (id !== "pub") {
      setSuccess(null);
      setError(ERRORS[Math.floor(Math.random() * ERRORS.length)]);
      return;
    }
    setError(null);
    setSuccess(SUCCESS[Math.floor(Math.random() * SUCCESS.length)]);
    onSelect(id);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="retro text-[10px] text-muted-foreground">
        Choose a meeting venue
      </p>

      {error && (
        <div className="retro text-[9px] text-destructive bg-destructive/10 border-2 border-destructive/30 p-2 text-center animate-pulse">
          {error}
        </div>
      )}

      {success && (
        <div className="retro text-[9px] text-green-400 bg-green-500/10 border-2 border-green-500/30 p-2 text-center">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {venues.map((venue) => {
          const isSelected = selectedId === venue.id;
          return (
            <Card
              key={venue.id}
              font="normal"
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? "!border-primary bg-primary/10"
                  : "hover:!border-muted-foreground"
              }`}
              onClick={() => handleSelect(venue.id)}
            >
              <CardContent font="normal" className="p-3">
                <div className="flex items-start gap-3">
                  <span
                    className="text-2xl leading-none mt-0.5 pixelated"
                    aria-hidden="true"
                  >
                    {venue.icon}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-foreground">
                      {venue.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {venue.description}
                    </div>
                  </div>
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
          Next: Review & Send
        </Button>
      </div>
    </div>
  );
}
