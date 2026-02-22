# Let's Meet Up 🗓️

> **Stop the 47-message group chat. Just meet.**

A Claude MCP app that coordinates group meetups — finding overlapping availability, picking a restaurant everyone can eat at, and firing off personalised WhatsApp invites — all from a single conversation with Claude.

**Try it now:** add `https://claude-mcp-hackathon-269be8d5.alpic.live/mcp` as a remote MCP server in Claude settings.

---

## The Problem

Getting a group of friends together should be simple. Instead it looks like this:

> *"When is everyone free?"*
> *"Idk, maybe Thursday?"*
> *"I can't do Thursday"*
> *"What about Saturday?"*
> *[7 hours of silence]*
> *"Actually I can do Thursday now"*
> *"Where should we go?"*
> *"Doesn't matter to me"*
> *"Same"*

**Let's Meet Up** solves this in four steps, inside Claude. No app to install. No Doodle poll to circulate. No group chat archaeology.

---

## The Four Archetypes

Real social groups have a mix of personalities — and a generic "hey we're meeting up!" message lands differently depending on who's reading it. This app knows that.

### 🐝 The Bee
*Organised & reliable.* Has their calendar colour-coded three months out. Will RSVP within the hour and remind everyone else twice. The reason the meetup actually happens.

**Gets a message like:**
> *"Hey Alice! 🐝 You can sit back on this one — I've sorted everything. We're going to Sushi Samba on Friday at 7pm. See you there!"*

### ⚓ The Captain
*Organised but flaky.* Loves the idea of plans, commits confidently, then ghosts for two days before resurfacing with a conflict. Responds well to firm, no-nonsense briefs that make backing out feel harder than showing up.

**Gets a message like:**
> *"Sam, mission briefing: ⚓ we're convening at Sushi Samba, 22 Bishops Gate, Friday at 19:00. Don't be late!"*

### 🐶 The Golden Retriever
*Reliable but laid-back.* Will go wherever, eat whatever, show up whenever — as long as the energy is right. Needs enthusiasm, not logistics.

**Gets a message like:**
> *"Jordan!! 🐶 We're all hanging out at Sushi Samba on Friday at 7 — it's going to be SO good. Can't wait to see you!"*

### 🪰 The Fruit Fly
*Spontaneous & unpredictable.* Ignores any plan made more than 48 hours in advance. But text them the same day with a short ping? 60% of the time, it works every time.

**Gets a message like:**
> *"Taylor 🪰 last-minute ping: Sushi Samba, Friday 19:00. Come if you can!"*

---

## How It Works

```
You: "Let's get dinner this week"
              │
              ▼
  ┌───────────────────────┐
  │  1. Pick your crew    │  Select from contacts (with archetypes
  │                       │  + cuisine prefs + dietary restrictions)
  └──────────┬────────────┘
             │
             ▼
  ┌───────────────────────┐
  │  2. Find a window     │  Server intersects everyone's weekly
  │                       │  recurring availability → real dates
  └──────────┬────────────┘
             │
             ▼
  ┌───────────────────────┐
  │  3. Pick a restaurant │  Yelp API filtered by the group's
  │                       │  cuisines + dietary restrictions
  └──────────┬────────────┘
             │
             ▼
  ┌───────────────────────┐
  │  4. Send the invites  │  Archetype-personalised WhatsApp
  │                       │  deep-links, one tap per contact
  └───────────────────────┘
```

### Availability Without the Poll

Rather than asking everyone to fill in a Doodle every time, availability is stored as **recurring weekly windows** — *"free Wednesday evenings, Thursday evenings"* — which is how most people actually think about their time.

When you select a group, the server:
1. Fetches everyone's `(day_of_week, start_time, end_time)` from Supabase
2. Groups by day
3. Computes the **intersection** (latest start, earliest end) across all selected contacts
4. Projects the next 4 upcoming dates for each day with overlap

```
Wednesday:
  Alice  18:00–22:00
  Bob    18:00–21:30  ← tightest end
  Cara   18:00–21:00  ← tightest end
  Dan    17:00–23:00
  Finn   18:00–22:00
              ──────
  Overlap → 18:00–21:00  ✓  (next 4 Wednesdays shown)
```

### Restaurant Matching

Each contact stores cuisine preferences and dietary restrictions. When looking for somewhere to eat, the app unions preferences across the whole selected group and queries Yelp with those filters — so a vegetarian and a meat-eater both end up somewhere they can actually order from.

### Personalised Messages

Each contact has an archetype. The invite message is written to match their communication style — detailed and warm for Bees, punchy for Captains, high-energy for Golden Retrievers, ultra-brief for Fruit Flies. Dietary accommodations are called out for contacts who have them. Messages open pre-filled in WhatsApp; you just tap send.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| MCP Framework | [Skybridge](https://docs.skybridge.tech) |
| Server | Node.js + Express (TypeScript) |
| Widget UI | React 19 + [8bitcn](https://www.8bitcn.com/) retro pixel components |
| Database | Supabase (PostgreSQL) |
| Restaurants | Yelp Fusion API |
| Messaging | WhatsApp deep-links (`wa.me`) |
| Deployment | [Alpic](https://alpic.ai) |

---

## Running Locally

**Prerequisites:** Node.js 24+, pnpm, Supabase CLI

```bash
# Install dependencies
pnpm i

# Configure environment
cp .env.example .env
# Fill in: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Push database schema + seed data
supabase link
supabase db push

# Start dev server
volta run --node 24.10.0 -- npx skybridge dev
# → Devtools at http://localhost:3000
# → MCP endpoint at http://localhost:3000/mcp
```

**Test with Claude (local):**
```bash
# Tunnel to localhost
cloudflared tunnel --url http://localhost:3000

# Add the tunnel URL + /mcp as a remote MCP server in Claude settings
# e.g. https://xxx.trycloudflare.com/mcp
```

**Build for production:**
```bash
pnpm build   # skybridge build + tsc server compilation
pnpm start   # skybridge start (requires dist/index.js)
```

---

## Project Structure

```
server/src/
  index.ts        — Express app, CORS, static assets, port binding
  server.ts       — MCP widgets: plan-meetup + lets-meet-up tools
  meetup-db.ts    — Supabase queries + availability intersection logic
  restaurants.ts  — Yelp API integration
  env.ts          — Environment variable validation (t3-env)

web/src/
  widgets/
    plan-meetup.tsx     — Main 4-step widget (mounts in Claude)
  components/steps/
    Splash.tsx          — Welcome + mode selection (social vs work)
    SelectContacts.tsx  — Contact picker with archetype badges
    PickTime.tsx        — Overlapping time slot selection
    PickRestaurant.tsx  — Restaurant cards with cuisine/diet filters
    ConfirmSend.tsx     — Message previews + WhatsApp send buttons
  data/
    meetup-service.ts   — Client-side data helpers
    mock-contacts.ts    — Fallback demo contacts

supabase/migrations/    — Schema definitions + seed data
```

---

## Roadmap / Nice-to-Haves

- **Add a friend** — invite someone by phone number; they choose their own archetype and fill in their weekly availability via a shared link
- **iCal / Google Calendar sync** — pull real free/busy instead of manually-set windows
- **Memory across meetups** — Claude remembers where you've been with which group, surfaces patterns (*"you always end up doing Italian on Wednesdays"*)
- **Group dynamics balancing** — flags when the invite list has too many Fruit Flies and suggests a backup plan
- **Booking integration** — OpenTable / Resy links directly from restaurant cards
- **Post-meetup follow-up** — auto-send a "great seeing you!" the next morning, or surface who you haven't seen in a while
- **Work mode** — same flow but for team standups, socials, and retrospectives; venue options include office, pub, or Google Meet

---

## Built at

[Skybridge MCP Hackathon](https://docs.skybridge.tech) · February 2026
