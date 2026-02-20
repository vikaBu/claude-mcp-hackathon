import { useState } from "react";
import type { Contact, TimeSlot, Restaurant, MessagePreview } from "@/types/meetup";

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
        <div className="text-4xl">+</div>
        <p className="font-heading text-green-400 text-sm">Invites Sent!</p>
        <p className="text-xs text-zinc-400 text-center">
          WhatsApp messages sent to {contacts.length} people for{" "}
          {restaurant.name} on {formatDate(timeSlot.date)}.
        </p>
        <div className="flex flex-col gap-1 w-full mt-2">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 p-2 border border-green-500/20 bg-green-500/5"
            >
              <span className="text-green-400 text-xs">+</span>
              <span className="text-sm">{c.name}</span>
              <span className="text-xs text-zinc-500 ml-auto">{c.phone}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-400 font-heading">Review & Send</p>

      {/* Summary */}
      <div className="border-2 border-zinc-700 bg-zinc-800/50 p-3">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Who</span>
            <span>{contacts.map((c) => c.name.split(" ")[0]).join(", ")}</span>
          </div>
          <div className="h-px bg-zinc-700" />
          <div className="flex justify-between">
            <span className="text-zinc-400">When</span>
            <span>
              {formatDate(timeSlot.date)}, {formatTime(timeSlot.startTime)}
            </span>
          </div>
          <div className="h-px bg-zinc-700" />
          <div className="flex justify-between">
            <span className="text-zinc-400">Where</span>
            <span>{restaurant.name}</span>
          </div>
        </div>
      </div>

      {/* Message previews */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-zinc-500 font-heading">
          Message Previews
        </p>
        {previews.map((preview) => (
          <div
            key={preview.contactId}
            className="border border-zinc-700 bg-zinc-800/30 p-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-xs">{preview.contactName}</span>
              <span className="text-[10px] text-zinc-500">{preview.phone}</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {preview.message}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          disabled={sending}
          className="flex-1 py-2.5 font-heading text-xs border-2 border-zinc-600 text-zinc-400 hover:border-zinc-500 cursor-pointer transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSend}
          disabled={sending}
          className={`
            flex-1 py-2.5 font-heading text-xs border-2 transition-colors
            ${
              sending
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-300/50 cursor-wait"
                : "border-green-500 bg-green-500/20 text-green-300 hover:bg-green-500/30 cursor-pointer"
            }
          `}
        >
          {sending ? "Sending..." : "Send WhatsApp Invites"}
        </button>
      </div>
    </div>
  );
}
