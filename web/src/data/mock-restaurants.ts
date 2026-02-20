import type { Restaurant } from "@/types/meetup";

export const mockRestaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Pixel Ramen House",
    cuisine: "Japanese",
    rating: 4.5,
    priceRange: "$$",
    tags: ["Ramen", "Sushi", "Vegetarian Options"],
  },
  {
    id: "r2",
    name: "8-Bit Taqueria",
    cuisine: "Mexican",
    rating: 4.2,
    priceRange: "$",
    tags: ["Tacos", "Burritos", "Gluten-Free Options"],
  },
  {
    id: "r3",
    name: "Retro Curry Palace",
    cuisine: "Indian",
    rating: 4.7,
    priceRange: "$$",
    tags: ["Curry", "Vegan Options", "Spicy"],
  },
  {
    id: "r4",
    name: "Arcade Trattoria",
    cuisine: "Italian",
    rating: 4.3,
    priceRange: "$$$",
    tags: ["Pasta", "Pizza", "Vegetarian Options"],
  },
  {
    id: "r5",
    name: "NES Noodle Bar",
    cuisine: "Thai",
    rating: 4.4,
    priceRange: "$$",
    tags: ["Pad Thai", "Curry", "Vegan Options"],
  },
];
