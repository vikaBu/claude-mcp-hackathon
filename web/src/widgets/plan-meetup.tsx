import "@/index.css";
import { mountWidget, useLayout, useDisplayMode, useWidgetState } from "skybridge/web";
import { useToolInfo } from "../helpers";
import { StepProgress } from "@/components/StepProgress";
import { SelectContacts } from "@/components/steps/SelectContacts";
import { PickTime } from "@/components/steps/PickTime";
import { PickRestaurant } from "@/components/steps/PickRestaurant";
import { ConfirmSend } from "@/components/steps/ConfirmSend";
import {
  getContacts,
  getAvailableTimeSlots,
  getRestaurantRecommendations,
  generateMessagePreviews,
  sendMessages,
} from "@/data/meetup-service";
import type { Contact, TimeSlot, MeetupStep } from "@/types/meetup";
import { Maximize2, Minimize2 } from "lucide-react";

type WidgetState = Record<string, unknown> & {
  currentStep: MeetupStep;
  selectedContactIds: string[];
  selectedTimeSlotId: string | null;
  selectedRestaurantId: string | null;
};

const initialState: WidgetState = {
  currentStep: "contacts",
  selectedContactIds: [],
  selectedTimeSlotId: null,
  selectedRestaurantId: null,
};

function PlanMeetup() {
  const { output, isPending } = useToolInfo<"plan-meetup">();
  const { theme } = useLayout();
  const isDark = theme === "dark";
  const [displayMode, requestDisplayMode] = useDisplayMode();
  const isFullscreen = displayMode === "fullscreen";

  const [state, setState] = useWidgetState<WidgetState>(initialState);
  const { currentStep, selectedContactIds, selectedTimeSlotId, selectedRestaurantId } =
    state ?? initialState;

  const contacts = (output?.contacts as Contact[] | undefined) ?? getContacts();
  const rawTimeSlots = output?.timeSlots as TimeSlot[] | undefined;
  const selectedContacts = contacts.filter((c) => selectedContactIds.includes(c.id));
  const availableSlots = rawTimeSlots
    ? rawTimeSlots.filter((s) => selectedContactIds.every((id) => s.availableFor.includes(id)))
    : getAvailableTimeSlots(selectedContactIds);
  const restaurants = getRestaurantRecommendations(selectedContacts);
  const selectedSlot = availableSlots.find((s) => s.id === selectedTimeSlotId) ?? null;
  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId) ?? null;

  const previews =
    selectedSlot && selectedRestaurant
      ? generateMessagePreviews(selectedContacts, selectedSlot, selectedRestaurant)
      : [];

  const toggleContact = (id: string) => {
    setState((prev) => {
      const s = prev ?? initialState;
      const ids = s.selectedContactIds.includes(id)
        ? s.selectedContactIds.filter((cid) => cid !== id)
        : [...s.selectedContactIds, id];
      return { ...s, selectedContactIds: ids };
    });
  };

  const goTo = (step: MeetupStep) => {
    setState((prev) => ({ ...(prev ?? initialState), currentStep: step }));
  };

  const llmSummary = [
    `Step: ${currentStep}`,
    `Contacts: ${selectedContacts.map((c) => c.name).join(", ") || "none"}`,
    selectedSlot ? `Time: ${selectedSlot.date} ${selectedSlot.startTime}` : null,
    selectedRestaurant ? `Restaurant: ${selectedRestaurant.name}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  if (isPending) {
    return (
      <div className={`${isDark ? "dark" : ""} p-4`}>
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="text-2xl animate-pulse">...</div>
          <p className="font-heading text-xs text-zinc-400">
            Loading Meetup Planner
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""} p-4 max-w-lg mx-auto`} data-llm={llmSummary}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-sm text-yellow-300">
          Meetup Planner
        </h1>
        <button
          onClick={() => requestDisplayMode(isFullscreen ? "inline" : "fullscreen")}
          className="p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
          aria-label={isFullscreen ? "Minimize" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {output?.prompt && (
        <div className="mb-3 p-2 border border-zinc-700 bg-zinc-800/50 text-xs text-zinc-300">
          {output.prompt}
        </div>
      )}

      <StepProgress currentStep={currentStep} />

      {currentStep === "contacts" && (
        <SelectContacts
          contacts={contacts}
          selectedIds={selectedContactIds}
          onToggle={toggleContact}
          onNext={() => goTo("time")}
        />
      )}

      {currentStep === "time" && (
        <PickTime
          timeSlots={availableSlots}
          selectedId={selectedTimeSlotId}
          totalContacts={selectedContactIds.length}
          onSelect={(id) =>
            setState((prev) => ({ ...(prev ?? initialState), selectedTimeSlotId: id }))
          }
          onNext={() => goTo("restaurant")}
          onBack={() => goTo("contacts")}
        />
      )}

      {currentStep === "restaurant" && (
        <PickRestaurant
          restaurants={restaurants}
          selectedId={selectedRestaurantId}
          onSelect={(id) =>
            setState((prev) => ({ ...(prev ?? initialState), selectedRestaurantId: id }))
          }
          onNext={() => goTo("confirm")}
          onBack={() => goTo("time")}
        />
      )}

      {currentStep === "confirm" && selectedSlot && selectedRestaurant && (
        <ConfirmSend
          contacts={selectedContacts}
          timeSlot={selectedSlot}
          restaurant={selectedRestaurant}
          previews={previews}
          onSend={() => sendMessages(previews).then(() => {})}
          onBack={() => goTo("restaurant")}
        />
      )}
    </div>
  );
}

export default PlanMeetup;

mountWidget(<PlanMeetup />);
