export interface Contact {
  id: string;
  name: string;
  phone: string;
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

export type MeetupStep = "contacts" | "time" | "restaurant" | "confirm";
