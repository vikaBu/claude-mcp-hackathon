import { McpServer } from "skybridge/server";
import { z } from "zod";
import { env } from "./env.js";
import { executeActions, fetchTasks } from "./supabase.js";
import { fetchContacts, findOverlappingSlots, createMeetup } from "./meetup-db.js";
import { fetchRestaurants } from "./restaurants.js";

const SERVER_URL = "http://localhost:3000";

const ActionSchema = z.object({
  type: z.enum(["add", "delete", "toggle", "move"]),
  title: z.string().optional().describe("Task title (required for add)"),
  priority: z
    .enum(["low", "medium", "high"])
    .optional()
    .describe("Task priority"),
  dueDate: z.string().optional().describe("Due date (ISO string)"),
  taskId: z.string().optional().describe("Task ID (required for delete/toggle/move)"),
  status: z.enum(["todo", "in_progress", "done"]).optional().describe("Target status (required for move)"),
});

const server = new McpServer(
  { name: "todo-app", version: "0.0.1" },
  { capabilities: {} },
).registerWidget(
  "manage-tasks",
  {
    description: "View and manage your to-do list",
    _meta: {
      ui: {
        csp: {
          resourceDomains: ["https://fonts.googleapis.com"],
          connectDomains: [env.SUPABASE_URL],
        },
      },
    },
  },
  {
    description:
      "Call with no arguments to display the user's task board. Pass an `actions` array to add, move, or delete tasks — all actions are applied before returning the updated list.",
    inputSchema: {
      actions: z
        .array(ActionSchema)
        .optional()
        .describe("Actions to perform before returning the task list"),
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  async ({ actions }, extra) => {
    const userId = (extra.authInfo?.extra as any)?.userId as
      | string
      | undefined;

    if (!userId) {
      return {
        content: [
          { type: "text", text: "Please sign in to manage your tasks." },
        ],
        isError: true,
        _meta: {
          "mcp/www_authenticate": [
            `Bearer resource_metadata="${SERVER_URL}/.well-known/oauth-protected-resource/mcp"`,
          ],
        },
      };
    }

    if (actions && actions.length > 0) {
      await executeActions(userId, actions);
    }

    const { tasks, error } = await fetchTasks(userId);

    if (error) {
      return {
        content: [
          { type: "text", text: `Error fetching tasks: ${error.message}` },
        ],
        isError: true,
      };
    }

    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const done = tasks.filter((t) => t.status === "done").length;

    return {
      structuredContent: { tasks },
      content: [
        {
          type: "text",
          text: `${todo} todo, ${inProgress} in progress, ${done} done. ${tasks.length} total tasks.`,
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
    description: "Plan a meetup — find overlapping times, get restaurant suggestions, and send WhatsApp invites",
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
    const userId = ((extra.authInfo?.extra as Record<string, unknown>)?.userId as string | undefined) ?? "demo-user";

    if (action.type === "fetch-contacts") {
      const { contacts, error } = await fetchContacts(userId);
      if (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
      return {
        structuredContent: { step: "select-contacts", contacts },
        content: [{ type: "text", text: `Found ${contacts.length} contacts.` }],
      };
    }

    if (action.type === "find-times") {
      const { slots, error } = await findOverlappingSlots(action.contactIds);
      if (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
      return {
        structuredContent: { step: "pick-time", slots },
        content: [{ type: "text", text: `Found ${slots.length} overlapping time slot(s).` }],
      };
    }

    if (action.type === "find-restaurants") {
      const { contacts, error: contactsError } = await fetchContacts(userId);
      if (contactsError) {
        return { content: [{ type: "text", text: `Error: ${contactsError.message}` }], isError: true };
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
          content: [{ type: "text", text: `Yelp error: ${(err as Error).message}` }],
          isError: true,
        };
      }

      return {
        structuredContent: { step: "pick-restaurant", restaurants },
        content: [{ type: "text", text: `Found ${restaurants.length} restaurant(s).` }],
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
        return { content: [{ type: "text", text: `Error: ${meetupError?.message}` }], isError: true };
      }

      const { contacts } = await fetchContacts(userId);
      const selected = contacts.filter((c) => action.contactIds.includes(c.id));

      const whatsappLinks = selected.map((contact) => {
        const digits = contact.phone_number.replace(/\D/g, "");
        const message = `Hey ${contact.name}! 🎉 We're meeting at ${action.restaurantName} (${action.restaurantAddress}) on ${action.date} at ${action.time}. See you there!`;
        const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
        return { name: contact.name, phone: contact.phone_number, url };
      });

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
            text: `Meetup confirmed at ${action.restaurantName} on ${action.date} at ${action.time}. ${whatsappLinks.length} WhatsApp link(s) ready.`,
          },
        ],
      };
    }

    return { content: [{ type: "text", text: "Unknown action type." }], isError: true };
  },
);

export default serverWithMeetup;
export type AppType = typeof serverWithMeetup;
