import type { Contact } from "@/types/meetup";

export const mockContacts: Contact[] = [
  {
    id: "c1",
    name: "Alex Kim",
    phone: "+1 (555) 123-4567",
    cuisinePreferences: ["Korean", "Japanese", "Thai"],
    dietaryRestrictions: [],
  },
  {
    id: "c2",
    name: "Jordan Lee",
    phone: "+1 (555) 234-5678",
    cuisinePreferences: ["Italian", "Mexican", "Japanese"],
    dietaryRestrictions: ["Vegetarian"],
  },
  {
    id: "c3",
    name: "Sam Rivera",
    phone: "+1 (555) 345-6789",
    cuisinePreferences: ["Mexican", "Thai", "Indian"],
    dietaryRestrictions: ["Gluten-Free"],
  },
  {
    id: "c4",
    name: "Taylor Chen",
    phone: "+1 (555) 456-7890",
    cuisinePreferences: ["Japanese", "Korean", "Italian"],
    dietaryRestrictions: [],
  },
  {
    id: "c5",
    name: "Morgan Patel",
    phone: "+1 (555) 567-8901",
    cuisinePreferences: ["Indian", "Thai", "Italian"],
    dietaryRestrictions: ["Vegan"],
  },
  {
    id: "c6",
    name: "Casey Wu",
    phone: "+1 (555) 678-9012",
    cuisinePreferences: ["Korean", "Mexican", "Japanese"],
    dietaryRestrictions: [],
  },
];
