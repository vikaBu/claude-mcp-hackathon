# Meetup Planner

## Value Proposition
Coordinate group meetups through conversation. Target: friend groups wanting to find a time, pick a restaurant, and confirm attendance. Pain: endless group chat back-and-forth, manually cross-referencing availability and food preferences.

**Core actions**: Select contacts, find overlapping availability, get restaurant recommendations matched to group preferences, send WhatsApp invites.

## Why LLM?
**Conversational win**: "Let's get dinner this weekend" = one sentence triggers the full planning flow.
**LLM adds**: Natural language intent, preference reasoning, message composition.
**What LLM lacks**: Persistent contact data (Supabase), restaurant search (Yelp API), messaging (WhatsApp).

## UI Overview
**First view**: Contact selection grid showing names, cuisine preferences, dietary restrictions.
**Key interactions**: Multi-step wizard — select contacts, pick time, choose restaurant, review & send.
**End state**: WhatsApp invites sent to all selected contacts.

## Product Context
- **Database**: Supabase (PostgreSQL) — contacts, availability
- **Auth**: Clerk OAuth
- **External APIs**: Yelp Places (restaurants), whatsapp-web.js (messaging)
- **Constraints**: Per-user contacts, authenticated access only

## UX Flows

Plan a meetup:
1. Select 2+ contacts from your list
2. Pick a time slot where all contacts are available
3. Choose a restaurant (scored by group cuisine preferences)
4. Review message previews and send WhatsApp invites

## Tools and Widgets

**Widget: plan-meetup**
- **Input**: `{ prompt?: string }`
- **Output**: `{ status, prompt }` — widget manages its own multi-step state
- **Views**: contact grid, time slot picker, restaurant cards, confirm & send
- **Behavior**:
  - Opens the 4-step meetup planner wizard
  - Optional prompt displayed at top (e.g. "Let's get dinner this weekend")
  - All step state managed client-side via `useWidgetState`

**Tool: send-meetup-invites**
- **Input**: `{ contactIds: string[], timeSlotId: string, restaurantId: string }`
- **Output**: `{ sent: boolean, contactIds, timeSlotId, restaurantId }`
