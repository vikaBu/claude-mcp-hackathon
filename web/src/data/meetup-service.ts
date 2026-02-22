import type { Contact, TimeSlot, Restaurant, MessagePreview, Archetype, MeetupMode, WorkVenue } from "@/types/meetup";
import { mockContacts } from "./mock-contacts";
import { mockTimeSlots } from "./mock-timeslots";
import { mockRestaurants } from "./mock-restaurants";

export function getContacts(): Contact[] {
  return mockContacts;
}

export function getAvailableTimeSlots(contactIds: string[]): TimeSlot[] {
  return mockTimeSlots.filter((slot) =>
    contactIds.every((id) => slot.availableFor.includes(id)),
  );
}

export function getRestaurantRecommendations(
  contacts: Contact[],
): (Restaurant & { matchScore: number })[] {
  const cuisineCounts = new Map<string, number>();
  for (const contact of contacts) {
    for (const cuisine of contact.cuisinePreferences) {
      cuisineCounts.set(cuisine, (cuisineCounts.get(cuisine) || 0) + 1);
    }
  }

  return mockRestaurants
    .map((restaurant) => {
      const score = cuisineCounts.get(restaurant.cuisine) || 0;
      return { ...restaurant, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating);
}

function buildMessage(
  contact: Contact,
  restaurant: Restaurant,
  dateStr: string,
  timeSlot: TimeSlot,
): string {
  const first = contact.name.split(" ")[0];
  const place = restaurant.name;
  const cuisine = restaurant.cuisine;
  const time = `${timeSlot.startTime}–${timeSlot.endTime}`;
  const dietary =
    contact.dietaryRestrictions.length > 0
      ? ` They have ${contact.dietaryRestrictions.join(" & ")} options.`
      : "";

  const templates: Record<Archetype, string> = {
    // Bees are organisers — this is their relief message, keep it warm & grateful
    bee: `Hey ${first}! 🐝 You can sit back on this one — I've sorted everything. ` +
      `We're going to ${place} (${cuisine}) on ${dateStr}, ${time}.${dietary} See you there!`,

    // Captains like to feel in-the-loop and given a clear directive
    captain: `${first}, mission briefing: ⚓ we're convening at ${place} (${cuisine}) ` +
      `on ${dateStr} at ${timeSlot.startTime}. Arrival expected by ${timeSlot.startTime}.${dietary} Don't be late!`,

    // Golden Retrievers are enthusiastic and easy-going
    golden_retriever: `${first}!! 🐶 Guess what — we're all hanging out at ${place} on ${dateStr}! ` +
      `${cuisine} food from ${time} — it's going to be SO good.${dietary} Can't wait to see you!`,

    // Fruit Flies are spontaneous — keep it short, punchy, low-commitment feel
    fruit_fly: `${first} 🪰 last-minute ping: ${place} (${cuisine}), ${dateStr} ${timeSlot.startTime}. ` +
      `Come if you can!${dietary}`,
  };

  return contact.archetype ? templates[contact.archetype] :
    `Hey ${first}! We're meeting at ${place} (${cuisine}) on ${dateStr}, ${time}.${dietary} See you there!`;
}

export function generateMessagePreviews(
  contacts: Contact[],
  timeSlot: TimeSlot,
  restaurant: Restaurant,
): MessagePreview[] {
  const date = new Date(timeSlot.date + "T00:00:00");
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return contacts.map((contact) => ({
    contactId: contact.id,
    contactName: contact.name,
    phone: contact.phone,
    message: buildMessage(contact, restaurant, dateStr, timeSlot),
  }));
}

export async function sendMessages(
  previews: MessagePreview[],
): Promise<{ success: boolean }> {
  for (const preview of previews) {
    const digits = preview.phone.replace(/\D/g, "");
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(preview.message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    // small delay so browsers don't block multiple popups
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return { success: true };
}

export const WORK_VENUES: WorkVenue[] = [
  { id: "office", name: "In Office", description: "Book a meeting room", icon: "🏢" },
  { id: "google_meet", name: "Over Google Meet", description: "Virtual video call", icon: "📹" },
  { id: "pub", name: "At the Pub", description: "The correct option", icon: "🍺" },
];

export function getWorkVenues(): WorkVenue[] {
  return WORK_VENUES;
}

const WORK_KEYWORDS = [
  "work", "meeting", "call", "standup", "stand-up", "sync", "review",
  "sprint", "retro", "planning", "1:1", "one-on-one", "brainstorm",
  "workshop", "office", "agenda", "check-in",
];

export function inferMode(prompt: string | null | undefined): MeetupMode {
  if (!prompt) return "social";
  const lower = prompt.toLowerCase();
  return WORK_KEYWORDS.some((kw) => lower.includes(kw)) ? "work" : "social";
}

function buildWorkMessage(
  contact: Contact,
  venue: WorkVenue,
  dateStr: string,
  timeSlot: TimeSlot,
): string {
  const first = contact.name.split(" ")[0];
  const time = `${timeSlot.startTime}–${timeSlot.endTime}`;

  // Venue-specific location phrasing
  const locationPhrase: Record<WorkVenue["id"], string> = {
    office: "in the office",
    google_meet: "via Google Meet",
    pub: "at the pub",
  };
  const location = locationPhrase[venue.id];

  // Google Meet gets an extra note about the invite
  const meetNote = venue.id === "google_meet" ? " I'll send the calendar invite with the link." : "";

  const templates: Record<Archetype, string> = {
    // Bees are organisers — clear, structured, grateful
    bee: `Hey ${first}! 🐝 All sorted — we have a work meeting ${location} on ${dateStr}, ${time}.${meetNote} See you there!`,

    // Captains want a clear directive and to feel in command
    captain: `${first}, briefing: ⚓ work sync ${location} on ${dateStr} at ${timeSlot.startTime}. ` +
      `Wrap up by ${timeSlot.endTime}.${meetNote} Be ready.`,

    // Golden Retrievers are upbeat about everything, even standups
    golden_retriever: `${first}!! 🐶 We've got a catch-up ${location} on ${dateStr} from ${time} — ` +
      `so excited to sync up!${meetNote} See you then!`,

    // Fruit Flies keep it short and low-pressure
    fruit_fly: `${first} 🪰 quick ping: work ${location}, ${dateStr} ${timeSlot.startTime}.${meetNote} You in?`,
  };

  return contact.archetype
    ? templates[contact.archetype]
    : `Hey ${first}! We have a work meeting ${location} on ${dateStr}, ${time}.${meetNote} See you there!`;
}

export function generateWorkMessagePreviews(
  contacts: Contact[],
  timeSlot: TimeSlot,
  venue: WorkVenue,
): MessagePreview[] {
  const date = new Date(timeSlot.date + "T00:00:00");
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return contacts.map((contact) => ({
    contactId: contact.id,
    contactName: contact.name,
    phone: contact.phone,
    message: buildWorkMessage(contact, venue, dateStr, timeSlot),
  }));
}
