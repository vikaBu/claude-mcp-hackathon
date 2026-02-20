import type { Contact, TimeSlot, Restaurant, MessagePreview, Archetype } from "@/types/meetup";
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
