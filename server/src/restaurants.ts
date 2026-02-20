import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env.js";

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  url: string;
  imageUrl: string;
}

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export async function fetchRestaurants(opts: {
  location: string;
  cuisines: string[];
  restrictions: string[];
}): Promise<Restaurant[]> {
  const cuisineList = opts.cuisines.length > 0 ? opts.cuisines.join(", ") : "any cuisine";
  const restrictionList = opts.restrictions.length > 0 ? opts.restrictions.join(", ") : "none";

  const prompt = `You are a restaurant recommendation assistant. Suggest exactly 5 restaurants in or near "${opts.location}" that serve ${cuisineList} cuisine and accommodate dietary restrictions: ${restrictionList}.

Respond ONLY with a valid JSON array of exactly 5 objects. No explanation, no markdown, just the raw JSON array.

Each object must have these exact fields:
- "id": a short kebab-case unique identifier (e.g. "sakura-japanese-kitchen")
- "name": restaurant name
- "address": full street address in ${opts.location}
- "rating": number between 3.5 and 5.0 (one decimal place)
- "reviewCount": integer between 50 and 2000
- "url": a plausible Google Maps search URL like "https://www.google.com/maps/search/?api=1&query=RESTAURANT+NAME+${encodeURIComponent(opts.location)}"
- "imageUrl": empty string ""`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  // Strip any markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  const parsed = JSON.parse(cleaned) as Restaurant[];
  return parsed.slice(0, 5);
}
