import { supabase } from "./supabase.js";

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  archetype: "bee" | "captain" | "golden_retriever" | "fruit_fly";
  cuisine_preferences: string[];
  dietary_restrictions: string[];
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

// UI-compatible timeslot with availableFor array and stable id
export interface UITimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableFor: string[]; // contact IDs
}

export interface Meetup {
  id: string;
  user_id: string;
  restaurant_name: string;
  restaurant_yelp_id: string | null;
  restaurant_address: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
}

export interface MeetupParticipant {
  id: string;
  meetup_id: string;
  contact_id: string;
  message_sent: boolean;
}

export async function fetchContacts(userId: string): Promise<{ contacts: Contact[]; error: Error | null }> {
  const { data, error } = await supabase
    .from("contacts")
    .select("id, user_id, name, phone_number, archetype, cuisine_preferences, dietary_restrictions")
    .eq("user_id", userId);

  if (error) {
    return { contacts: [], error: new Error(error.message) };
  }

  return { contacts: (data as Contact[]) ?? [], error: null };
}

const DAY_ORDER = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

/** Returns the next N upcoming dates (from today) for a given day-of-week name */
function nextDates(dayName: string, count = 4): string[] {
  const targetDow = DAY_ORDER.indexOf(dayName);
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let offset = 0; dates.length < count; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    if (d.getDay() === targetDow) {
      dates.push(d.toISOString().slice(0, 10));
    }
  }
  return dates;
}

export async function findOverlappingSlots(contactIds: string[]): Promise<{ slots: TimeSlot[]; error: Error | null }> {
  if (contactIds.length === 0) {
    return { slots: [], error: null };
  }

  const { data, error } = await supabase
    .from("availability")
    .select("contact_id, day_of_week, start_time, end_time")
    .in("contact_id", contactIds);

  if (error) {
    return { slots: [], error: new Error(error.message) };
  }

  const rows = data as { contact_id: string; day_of_week: string; start_time: string; end_time: string }[];

  // Group by day_of_week -> contact_id -> windows
  const byDay = new Map<string, Map<string, { start: string; end: string }[]>>();
  for (const row of rows) {
    if (!byDay.has(row.day_of_week)) byDay.set(row.day_of_week, new Map());
    const byContact = byDay.get(row.day_of_week)!;
    if (!byContact.has(row.contact_id)) byContact.set(row.contact_id, []);
    byContact.get(row.contact_id)!.push({ start: row.start_time, end: row.end_time });
  }

  const slots: TimeSlot[] = [];

  for (const [day, byContact] of byDay.entries()) {
    if (!contactIds.every((id) => byContact.has(id))) continue;

    let overlapStart = "00:00";
    let overlapEnd = "23:59";
    for (const contactId of contactIds) {
      const w = byContact.get(contactId)!.reduce((a, b) => (a.start <= b.start ? a : b));
      if (w.start > overlapStart) overlapStart = w.start;
      if (w.end < overlapEnd) overlapEnd = w.end;
    }

    if (overlapStart < overlapEnd) {
      for (const date of nextDates(day)) {
        slots.push({ date, startTime: overlapStart.slice(0, 5), endTime: overlapEnd.slice(0, 5) });
      }
    }
  }

  slots.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  return { slots, error: null };
}

export async function createMeetup(
  userId: string,
  data: {
    restaurantName: string;
    restaurantYelpId: string | null;
    restaurantAddress: string;
    date: string;
    time: string;
    contactIds: string[];
  },
): Promise<{ meetup: Meetup | null; participants: MeetupParticipant[]; error: Error | null }> {
  const { data: meetupRows, error: meetupError } = await supabase
    .from("meetups")
    .insert({
      user_id: userId,
      restaurant_name: data.restaurantName,
      restaurant_yelp_id: data.restaurantYelpId ?? null,
      restaurant_address: data.restaurantAddress,
      date: data.date,
      time: data.time,
      status: "confirmed",
    })
    .select()
    .single();

  if (meetupError) {
    return { meetup: null, participants: [], error: new Error(meetupError.message) };
  }

  const meetup = meetupRows as Meetup;

  const participantInserts = data.contactIds.map((contactId) => ({
    meetup_id: meetup.id,
    contact_id: contactId,
    message_sent: false,
  }));

  const { data: participantRows, error: participantError } = await supabase
    .from("meetup_participants")
    .insert(participantInserts)
    .select();

  if (participantError) {
    return { meetup, participants: [], error: new Error(participantError.message) };
  }

  return { meetup, participants: (participantRows as MeetupParticipant[]) ?? [], error: null };
}

export async function fetchAllTimeSlotsWithAvailability(
  contactIds: string[],
): Promise<{ slots: UITimeSlot[]; error: Error | null }> {
  if (contactIds.length === 0) {
    return { slots: [], error: null };
  }

  const { data, error } = await supabase
    .from("availability")
    .select("contact_id, day_of_week, start_time, end_time")
    .in("contact_id", contactIds);

  if (error) {
    return { slots: [], error: new Error(error.message) };
  }

  const rows = data as { contact_id: string; day_of_week: string; start_time: string; end_time: string }[];

  // Group by day_of_week -> contact_id -> windows
  const byDay = new Map<string, Map<string, { start: string; end: string }[]>>();
  for (const row of rows) {
    if (!byDay.has(row.day_of_week)) byDay.set(row.day_of_week, new Map());
    const byContact = byDay.get(row.day_of_week)!;
    if (!byContact.has(row.contact_id)) byContact.set(row.contact_id, []);
    byContact.get(row.contact_id)!.push({ start: row.start_time, end: row.end_time });
  }

  const slots: UITimeSlot[] = [];

  for (const [day, byContact] of byDay.entries()) {
    // For each day, find which contacts are available and their intersection
    const availableContactIds = contactIds.filter((id) => byContact.has(id));
    if (availableContactIds.length === 0) continue;

    // Compute the time window available to ALL contacts on this day
    let overlapStart = "00:00";
    let overlapEnd = "23:59";
    for (const id of availableContactIds) {
      const w = byContact.get(id)!.reduce((a, b) => (a.start <= b.start ? a : b));
      if (w.start > overlapStart) overlapStart = w.start;
      if (w.end < overlapEnd) overlapEnd = w.end;
    }

    if (overlapStart >= overlapEnd) continue;

    for (const date of nextDates(day)) {
      slots.push({
        id: `slot-${date}-${overlapStart.replace(":", "")}`,
        date,
        startTime: overlapStart.slice(0, 5),
        endTime: overlapEnd.slice(0, 5),
        availableFor: availableContactIds,
      });
    }
  }

  slots.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  return { slots, error: null };
}

export async function markMessageSent(meetupId: string, contactId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("meetup_participants")
    .update({ message_sent: true })
    .eq("meetup_id", meetupId)
    .eq("contact_id", contactId);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}
