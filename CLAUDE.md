# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Before writing code, first explore the project structure, then invoke the mcp-app-builder skill for documentation.

## Project Overview

MCP app for coordinating group meetups. Workflow:
1. User says something like "Lets meet up"
2. App suggests times that work for all people (availability from Supabase mock DB)
3. User gets restaurant recommendations (Yelp API) matching the group's preferences
4. User picks a time + restaurant, app composes WhatsApp messages to confirm with everyone

**Tech stack:** Skybridge MCP framework, Express, React 19, Supabase (PostgreSQL), Yelp Places API, whatsapp-web.js, 8bitcn component library (retro/pixel aesthetic)

## Commands

```bash
pnpm i              # Install dependencies
volta run --node 24.10.0 -- npx skybridge dev  # Start dev server at http://localhost:3000
pnpm build           # Production build (skybridge build)
pnpm start           # Start production server (skybridge start)
pnpm deploy          # Deploy via Alpic

supabase link        # Link to remote Supabase project (one-time)
supabase db push     # Apply migrations to remote DB
supabase migration new <name>  # Create new migration file
```

Dev server includes Skybridge devtools at `http://localhost:3000` (no `/mcp` suffix). The MCP endpoint is at `/mcp`.

## Architecture

This is a **Skybridge MCP app** with two layers:

### Server (`server/src/`)
- `index.ts` — Express app setup: Clerk auth middleware, CORS, MCP transport, Skybridge devtools (dev only), static assets (prod)
- `server.ts` — `McpServer` instance. Registers widgets (MCP tools that return UI). Each widget defines a Zod input schema and a handler that reads/writes Supabase
- `middleware.ts` — Wires `StreamableHTTPServerTransport` to the Express `/mcp` route
- `supabase.ts` — Supabase client + query functions (`executeActions`, `fetchTasks`)
- `env.ts` — Environment variable validation via `@t3-oss/env-core` (requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`)

### Web (`web/src/`)
- `widgets/` — Each file is a widget entry point. Uses `mountWidget()` from Skybridge to register the React component
- `components/` — Shared React components used by widgets
- `helpers.ts` — Type-safe Skybridge hooks (`useToolInfo`, `useCallTool`) generated from the server's `AppType`
- `vite.config.ts` — Vite config with Skybridge plugin and `@` alias to `web/src/`

### Key patterns
- **Optimistic updates:** Widget UI updates state locally first, then syncs with server via `callToolAsync`. A mutation counter prevents stale responses from overwriting newer state
- **Widget ↔ Server type safety:** `web/src/helpers.ts` imports `AppType` from the server, giving widgets type-checked tool arguments and structured output
- **Auth flow:** Clerk handles OAuth. Unauthenticated requests to widgets return a `www_authenticate` challenge pointing to the `.well-known` endpoints

### Database
Migrations in `supabase/migrations/`. After editing or adding a migration, run `supabase db push`.

## Environment Variables

Copy `.env.example` to `.env` and fill in: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`.

## Connecting to Claude

Tunnel local server with cloudflared, then add the tunnel URL + `/mcp` as a remote MCP server:
```bash
cloudflared tunnel --url http://localhost:3000
```

## UI Library

Use the **8bitcn** component library (https://www.8bitcn.com/) for all UI — retro pixel art aesthetic.
