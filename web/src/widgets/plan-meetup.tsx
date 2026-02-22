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
import "@/components/ui/8bit/styles/retro.css";

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
  const currentStep = state?.currentStep ?? initialState.currentStep;
  const selectedContactIds = state?.selectedContactIds ?? initialState.selectedContactIds;
  const selectedTimeSlotId = state?.selectedTimeSlotId ?? initialState.selectedTimeSlotId;
  const selectedRestaurantId = state?.selectedRestaurantId ?? initialState.selectedRestaurantId;

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

  const mergeState = (prev: WidgetState | null | undefined): WidgetState => ({
    ...initialState,
    ...(prev ?? {}),
  });

  const toggleContact = (id: string) => {
    setState((prev) => {
      const s = mergeState(prev);
      const ids = s.selectedContactIds.includes(id)
        ? s.selectedContactIds.filter((cid) => cid !== id)
        : [...s.selectedContactIds, id];
      return { ...s, selectedContactIds: ids };
    });
  };

  const goTo = (step: MeetupStep) => {
    setState((prev) => ({ ...mergeState(prev), currentStep: step }));
  };

  const llmSummary = [
    `Step: ${currentStep}`,
    `Contacts: ${selectedContacts.map((c) => c.name).join(", ") || "none"}`,
    selectedSlot ? `Time: ${selectedSlot.date} ${selectedSlot.startTime}` : null,
    selectedRestaurant ? `Restaurant: ${selectedRestaurant.name}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  // In standalone preview mode (no tool invocation), isPending stays true forever.
  // Only show loading if we have a server context that's still resolving.
  if (isPending && output !== undefined) {
    return (
      <div className={`${isDark ? "dark" : ""} p-4`}>
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="retro text-2xl text-primary animate-pulse">...</div>
          <p className="retro text-xs text-muted-foreground">
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
        <h1 className="retro text-sm text-primary">
          Meetup Planner
        </h1>
        <button
          onClick={() => requestDisplayMode(isFullscreen ? "inline" : "fullscreen")}
          className="retro text-[10px] p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          aria-label={isFullscreen ? "Minimize" : "Fullscreen"}
        >
          {isFullscreen ? "[-]" : "[+]"}
        </button>
      </div>

      {output?.prompt && (
        <div className="mb-3 p-2 border-2 border-border bg-card text-xs text-muted-foreground">
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
          selectedContactIds={selectedContactIds}
          onSelect={(id) =>
            setState((prev) => ({ ...mergeState(prev), selectedTimeSlotId: id }))
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
            setState((prev) => ({ ...mergeState(prev), selectedRestaurantId: id }))
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
