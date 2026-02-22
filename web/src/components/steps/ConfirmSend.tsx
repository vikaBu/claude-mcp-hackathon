import { useState } from "react";
import type { Contact, TimeSlot, Restaurant, MessagePreview } from "@/types/meetup";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Separator } from "@/components/ui/8bit/separator";

interface ConfirmSendProps {
  contacts: Contact[];
  timeSlot: TimeSlot;
  restaurant: Restaurant;
  previews: MessagePreview[];
  onSend: () => Promise<void>;
  onBack: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
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

export function ConfirmSend({
  contacts,
  timeSlot,
  restaurant,
  previews,
  onSend,
  onBack,
}: ConfirmSendProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await onSend();
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="text-4xl text-green-400">+</div>
        <p className="retro text-green-400 text-sm">Invites Sent!</p>
        <p className="text-xs text-muted-foreground text-center">
          WhatsApp messages sent to {contacts.length} people for{" "}
          {restaurant.name} on {formatDate(timeSlot.date)}.
        </p>
        <div className="flex flex-col gap-1 w-full mt-2">
          {contacts.map((c) => (
            <Card key={c.id} font="normal" className="!border-green-500/30 bg-green-500/5">
              <CardContent font="normal" className="p-2 flex items-center gap-2">
                <span className="text-green-400 text-xs">+</span>
                <span className="text-sm text-foreground">{c.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {c.phone}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="retro text-[10px] text-muted-foreground">Review & Send</p>

      {/* Summary */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Who</span>
              <span className="text-foreground">
                {contacts.map((c) => c.name.split(" ")[0]).join(", ")}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">When</span>
              <span className="text-foreground">
                {formatDate(timeSlot.date)}, {formatTime(timeSlot.startTime)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Where</span>
              <span className="text-foreground">{restaurant.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message previews */}
      <div className="flex flex-col gap-2">
        <p className="retro text-[8px] text-muted-foreground">
          Message Previews
        </p>
        {previews.map((preview) => (
          <Card key={preview.contactId} font="normal">
            <CardContent font="normal" className="p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xs text-foreground">
                  {preview.contactName}
                </span>
                <Badge
                  variant="secondary"
                  font="normal"
                  className="text-[8px] text-muted-foreground"
                >
                  {preview.phone}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {preview.message}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onBack}
          disabled={sending}
          variant="outline"
          className="flex-1 text-xs"
        >
          Back
        </Button>
        <Button
          onClick={handleSend}
          disabled={sending}
          className="flex-1 text-xs"
        >
          {sending ? "Sending..." : "Send WhatsApp Invites"}
        </Button>
      </div>
    </div>
  );
}
