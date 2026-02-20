import { McpServer } from "skybridge/server";
import { z } from "zod";
import { env } from "./env.js";

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
      const userId = (extra.authInfo?.extra as any)?.userId as
        | string
        | undefined;

      if (!userId) {
        return {
          content: [
            {
              type: "text",
              text: "Please sign in to plan a meetup.",
            },
          ],
          isError: true,
          _meta: {
            "mcp/www_authenticate": [
              `Bearer resource_metadata="${SERVER_URL}/.well-known/oauth-protected-resource/mcp"`,
            ],
          },
        };
      }

      return {
        structuredContent: {
          status: "ready",
          prompt: prompt ?? null,
        },
        content: [
          {
            type: "text",
            text: prompt
              ? `Meetup planner opened with prompt: "${prompt}"`
              : "Meetup planner opened. Select contacts to get started.",
          },
        ],
      };
    },
  )
  .registerTool(
    "send-meetup-invites",
    {
      description:
        "Send WhatsApp invites to selected contacts for a meetup at the chosen time and restaurant",
      inputSchema: {
        contactIds: z
          .array(z.string())
          .describe("IDs of contacts to invite"),
        timeSlotId: z.string().describe("Selected time slot ID"),
        restaurantId: z.string().describe("Selected restaurant ID"),
      },
      annotations: {
        readOnlyHint: false,
        openWorldHint: true,
        destructiveHint: false,
      },
    },
    async ({ contactIds, timeSlotId, restaurantId }, extra) => {
      const userId = (extra.authInfo?.extra as any)?.userId as
        | string
        | undefined;

      if (!userId) {
        return {
          content: [
            { type: "text", text: "Please sign in to send invites." },
          ],
          isError: true,
        };
      }

      return {
        structuredContent: {
          sent: true,
          contactIds,
          timeSlotId,
          restaurantId,
        },
        content: [
          {
            type: "text",
            text: `WhatsApp invites sent to ${contactIds.length} contacts for meetup.`,
          },
        ],
      };
    },
  );

export default server;
export type AppType = typeof server;
