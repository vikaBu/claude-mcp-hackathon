import { McpServer } from "skybridge/server";
import { z } from "zod";
import { env } from "./env.js";
import {
  fetchContacts,
  findOverlappingSlots,
  createMeetup,
  fetchAllTimeSlotsWithAvailability,
} from "./meetup-db.js";
import { fetchRestaurants } from "./restaurants.js";

const SERVER_URL = "http://localhost:3000";

const server = new McpServer(
  { name: "meetup-planner", version: "0.0.1" },
  { capabilities: {} },
)
  .registerWidget(
    "plan-meetup",
    {
      description:
        "Plan a group meetup — select contacts, pick a time, choose a restaurant, and send WhatsApp invites",
      _meta: {
        ui: {
          csp: {
            resourceDomains: [
              "https://fonts.googleapis.com",
              "https://fonts.gstatic.com",
            ],
            connectDomains: [env.SUPABASE_URL],
          },
        },
      },
    },
    {
      description:
        "Opens the meetup planner. Optionally pass a prompt (e.g. 'Let's meet up this weekend') that the widget can display.",
      inputSchema: {
        prompt: z
          .string()
          .optional()
          .describe(
            "Natural language prompt like 'Let's get dinner this week'",
          ),
      },
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ prompt }, extra) => {
      const userId =
        ((extra.authInfo?.extra as Record<string, unknown>)?.userId as
          | string
          | undefined) ?? "demo-user";

      if (!userId) {
        return {
          content: [{ type: "text", text: "Please sign in to plan a meetup." }],
          isError: true,
          _meta: {
            "mcp/www_authenticate": [
              `Bearer resource_metadata="${SERVER_URL}/.well-known/oauth-protected-resource/mcp"`,
            ],
          },
        };
      }

      let uiContacts: Array<{ id: string; name: string; phone: string; cuisinePreferences: string[]; dietaryRestrictions: string[] }> = [];
      let slots: Awaited<ReturnType<typeof fetchAllTimeSlotsWithAvailability>>["slots"] = [];

      const { contacts, error: contactsError } = await fetchContacts(userId);
      if (contactsError) {
        console.warn(`Supabase unreachable, widget will use client-side mock data: ${contactsError.message}`);
      } else {
        const contactIds = contacts.map((c) => c.id);
        const slotsResult = await fetchAllTimeSlotsWithAvailability(contactIds);
        slots = slotsResult.slots;

        uiContacts = contacts.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone_number,
          cuisinePreferences: c.cuisine_preferences,
          dietaryRestrictions: c.dietary_restrictions,
        }));
      }

      return {
        structuredContent: {
          status: "ready",
          prompt: prompt ?? null,
          contacts: uiContacts.length > 0 ? uiContacts : undefined,
          timeSlots: slots.length > 0 ? slots : undefined,
        },
        content: [
          {
            type: "text",
            text: prompt
              ? `Meetup planner opened with prompt: "${prompt}"`
              : `Meetup planner opened. ${uiContacts.length} contacts loaded.`,
          },
        ],
      };
    },
  )
  .registerTool(
    "send-meetup-invites",
    {
      description:
        "Confirm a meetup by saving it to the database and returning WhatsApp deep-links for each contact",
      inputSchema: {
        contactIds: z.array(z.string()).describe("DB contact UUIDs to invite"),
        restaurantName: z.string().describe("Name of the chosen restaurant"),
        restaurantAddress: z.string().default("").describe("Address of the restaurant"),
        date: z.string().describe("Meetup date in YYYY-MM-DD format"),
        time: z.string().describe("Meetup time in HH:MM format"),
      },
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ contactIds, restaurantName, restaurantAddress, date, time }, extra) => {
      const userId =
        ((extra.authInfo?.extra as Record<string, unknown>)?.userId as
          | string
          | undefined) ?? "demo-user";

      const { meetup, error: meetupError } = await createMeetup(userId, {
        restaurantName,
        restaurantYelpId: null,
        restaurantAddress,
        date,
        time,
        contactIds,
      });

      if (meetupError || !meetup) {
        return {
          content: [{ type: "text", text: `Error saving meetup: ${meetupError?.message}` }],
          isError: true,
        };
      }

      const { contacts } = await fetchContacts(userId);
      const selected = contacts.filter((c) => contactIds.includes(c.id));

      const whatsappLinks = selected.map((contact) => {
        const digits = contact.phone_number.replace(/\D/g, "");
        const first = contact.name.split(" ")[0];
        const dietary = contact.dietary_restrictions.length > 0
          ? ` They have ${contact.dietary_restrictions.join(" & ")} options.` : "";
        const messages: Record<string, string> = {
          bee: `Hey ${first}! 🐝 You can sit back on this one — I've sorted everything. We're going to ${restaurantName} (${restaurantAddress}) on ${date} at ${time}.${dietary} See you there!`,
          captain: `${first}, mission briefing: ⚓ we're convening at ${restaurantName} (${restaurantAddress}) on ${date} at ${time}.${dietary} Don't be late!`,
          golden_retriever: `${first}!! 🐶 We're all hanging out at ${restaurantName} on ${date} at ${time} — it's going to be SO good.${dietary} Can't wait to see you!`,
          fruit_fly: `${first} 🪰 last-minute ping: ${restaurantName}, ${date} ${time}. Come if you can!${dietary}`,
        };
        const message = messages[contact.archetype] ??
          `Hey ${first}! 🎉 We're meeting at ${restaurantName} (${restaurantAddress}) on ${date} at ${time}.${dietary} See you there!`;
        return {
          name: contact.name,
          phone: contact.phone_number,
          url: `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
        };
      });

      return {
        structuredContent: { meetupId: meetup.id, whatsappLinks },
        content: [
          {
            type: "text",
            text: `Meetup saved! WhatsApp links ready for ${whatsappLinks.length} contacts.`,
          },
        ],
      };
    },
  );

const MeetupActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("fetch-contacts") }),
  z.object({ type: z.literal("find-times"), contactIds: z.array(z.string()) }),
  z.object({
    type: z.literal("find-restaurants"),
    contactIds: z.array(z.string()),
    location: z.string(),
  }),
  z.object({
    type: z.literal("confirm-meetup"),
    contactIds: z.array(z.string()),
    restaurantId: z.string(),
    restaurantName: z.string(),
    restaurantAddress: z.string(),
    date: z.string(),
    time: z.string(),
  }),
]);

const serverWithMeetup = server.registerWidget(
  "lets-meet-up",
  {
    description:
      "Plan a meetup — find overlapping times, get restaurant suggestions, and send WhatsApp invites",
    _meta: {
      ui: {
        csp: {
          connectDomains: [env.SUPABASE_URL, "https://api.anthropic.com"],
        },
      },
    },
  },
  {
    description:
      "4-step meetup planner. Start with fetch-contacts, then find-times with selected contactIds, then find-restaurants, then confirm-meetup to create the event and get WhatsApp links.",
    inputSchema: {
      action: MeetupActionSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  async ({ action }, extra) => {
    const userId =
      ((extra.authInfo?.extra as Record<string, unknown>)?.userId as
        | string
        | undefined) ?? "demo-user";

    if (action.type === "fetch-contacts") {
      const { contacts, error } = await fetchContacts(userId);
      if (error) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
      const contactList = contacts
        .map((c) => `- ${c.name} (id: ${c.id}, phone: ${c.phone_number}, cuisines: ${c.cuisine_preferences.join(", ")}, dietary: ${c.dietary_restrictions.join(", ") || "none"})`)
        .join("\n");
      return {
        structuredContent: { step: "select-contacts", contacts },
        content: [{ type: "text", text: `Found ${contacts.length} contacts:\n${contactList}` }],
      };
    }

    if (action.type === "find-times") {
      const { slots, error } = await findOverlappingSlots(action.contactIds);
      if (error) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
      const slotList = slots
        .map((s) => `- ${s.date} ${s.startTime}–${s.endTime}`)
        .join("\n");
      return {
        structuredContent: { step: "pick-time", slots },
        content: [
          {
            type: "text",
            text: slots.length > 0
              ? `Found ${slots.length} overlapping time slot(s):\n${slotList}`
              : "No overlapping time slots found for the selected contacts.",
          },
        ],
      };
    }

    if (action.type === "find-restaurants") {
      const { contacts, error: contactsError } = await fetchContacts(userId);
      if (contactsError) {
        return {
          content: [{ type: "text", text: `Error: ${contactsError.message}` }],
          isError: true,
        };
      }

      const selected = contacts.filter((c) => action.contactIds.includes(c.id));

      // Aggregate cuisine preferences and dietary restrictions across selected contacts
      const cuisineSet = new Set<string>();
      const restrictionSet = new Set<string>();
      for (const contact of selected) {
        contact.cuisine_preferences.forEach((p) => cuisineSet.add(p));
        contact.dietary_restrictions.forEach((r) => restrictionSet.add(r));
      }

      let restaurants: Awaited<ReturnType<typeof fetchRestaurants>> = [];
      try {
        restaurants = await fetchRestaurants({
          location: action.location,
          cuisines: Array.from(cuisineSet),
          restrictions: Array.from(restrictionSet),
        });
      } catch (err) {
        return {
          content: [
            { type: "text", text: `Yelp error: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }

      const restaurantList = restaurants
        .map((r) => `- ${r.name} (id: ${r.id}, rating: ${r.rating}, address: ${r.address})`)
        .join("\n");
      return {
        structuredContent: { step: "pick-restaurant", restaurants },
        content: [
          {
            type: "text",
            text: restaurants.length > 0
              ? `Found ${restaurants.length} restaurant(s):\n${restaurantList}`
              : "No restaurants found for that location.",
          },
        ],
      };
    }

    if (action.type === "confirm-meetup") {
      const { meetup, error: meetupError } = await createMeetup(userId, {
        restaurantName: action.restaurantName,
        restaurantYelpId: action.restaurantId,
        restaurantAddress: action.restaurantAddress,
        date: action.date,
        time: action.time,
        contactIds: action.contactIds,
      });

      if (meetupError || !meetup) {
        return {
          content: [{ type: "text", text: `Error: ${meetupError?.message}` }],
          isError: true,
        };
      }

      const { contacts } = await fetchContacts(userId);
      const selected = contacts.filter((c) => action.contactIds.includes(c.id));

      const whatsappLinks = selected.map((contact) => {
        const digits = contact.phone_number.replace(/\D/g, "");
        const first = contact.name.split(" ")[0];
        const dietary = contact.dietary_restrictions.length > 0
          ? ` They have ${contact.dietary_restrictions.join(" & ")} options.` : "";
        const messages: Record<string, string> = {
          bee: `Hey ${first}! 🐝 You can sit back on this one — I've sorted everything. We're going to ${action.restaurantName} (${action.restaurantAddress}) on ${action.date} at ${action.time}.${dietary} See you there!`,
          captain: `${first}, mission briefing: ⚓ we're convening at ${action.restaurantName} (${action.restaurantAddress}) on ${action.date} at ${action.time}.${dietary} Don't be late!`,
          golden_retriever: `${first}!! 🐶 We're all hanging out at ${action.restaurantName} on ${action.date} at ${action.time} — it's going to be SO good.${dietary} Can't wait to see you!`,
          fruit_fly: `${first} 🪰 last-minute ping: ${action.restaurantName}, ${action.date} ${action.time}. Come if you can!${dietary}`,
        };
        const message = messages[contact.archetype] ??
          `Hey ${first}! 🎉 We're meeting at ${action.restaurantName} (${action.restaurantAddress}) on ${action.date} at ${action.time}.${dietary} See you there!`;
        const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
        return { name: contact.name, phone: contact.phone_number, url };
      });

      const linkList = whatsappLinks.map((l) => `- ${l.name} (${l.phone}): ${l.url}`).join("\n");
      return {
        structuredContent: {
          step: "confirmed",
          meetup: {
            id: meetup.id,
            restaurantName: meetup.restaurant_name,
            restaurantAddress: meetup.restaurant_address,
            date: meetup.date,
            time: meetup.time,
          },
          whatsappLinks,
        },
        content: [
          {
            type: "text",
            text: `Meetup confirmed at ${action.restaurantName} on ${action.date} at ${action.time}.\n\nWhatsApp links:\n${linkList}`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: "Unknown action type." }],
      isError: true,
    };
  },
);

export default serverWithMeetup;
export type AppType = typeof serverWithMeetup;
