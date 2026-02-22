export type Archetype = "bee" | "captain" | "golden_retriever" | "fruit_fly";

export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  bee: "🐝 Bee",
  captain: "⚓ Captain",
  golden_retriever: "🐶 Golden Retriever",
  fruit_fly: "🪰 Fruit Fly",
};

export const ARCHETYPE_DESCRIPTION: Record<Archetype, string> = {
  bee: "organised & reliable",
  captain: "organised but flaky",
  golden_retriever: "reliable but laid-back",
  fruit_fly: "spontaneous & unpredictable",
};

export interface Contact {
  id: string;
  name: string;
  phone: string;
  archetype?: Archetype;
  avatarUrl?: string;
  cuisinePreferences: string[];
  dietaryRestrictions: string[];
}

export interface TimeSlot {
  id: string;
  date: string; // ISO date
  startTime: string; // e.g. "18:00"
  endTime: string; // e.g. "20:00"
  availableFor: string[]; // contact IDs
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number; // 1-5
  priceRange: "$" | "$$" | "$$$";
  tags: string[];
  imageUrl?: string;
}

export interface MeetupPlan {
  selectedContactIds: string[];
  selectedTimeSlotId: string | null;
  selectedRestaurantId: string | null;
}

export interface MessagePreview {
  contactId: string;
  contactName: string;
  phone: string;
  message: string;
}

export type MeetupStep = "splash" | "contacts" | "time" | "restaurant" | "confirm";

export type MeetupMode = "social" | "work";
export type WorkVenueType = "office" | "google_meet" | "pub";

export interface WorkVenue {
  id: WorkVenueType;
  name: string;
  description: string;
  icon: string;
}
