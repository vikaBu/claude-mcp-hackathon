import type { Contact, TimeSlot, Restaurant, MessagePreview } from "@/types/meetup";
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
    message:
      `Hey ${contact.name.split(" ")[0]}! We're meeting up at ${restaurant.name} ` +
      `on ${dateStr} from ${timeSlot.startTime} to ${timeSlot.endTime}. ` +
      `It's a ${restaurant.cuisine} place — hope that works for you! See you there!`,
  }));
}

export async function sendMessages(
  _previews: MessagePreview[],
): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true };
}
