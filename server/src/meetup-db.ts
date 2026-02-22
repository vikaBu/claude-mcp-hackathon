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

export async function findOverlappingSlots(contactIds: string[]): Promise<{ slots: TimeSlot[]; error: Error | null }> {
  if (contactIds.length === 0) {
    return { slots: [], error: null };
  }

  // Fetch all availability rows for the given contacts
  const { data, error } = await supabase
    .from("availability")
    .select("contact_id, date, start_time, end_time")
    .in("contact_id", contactIds);

  if (error) {
    return { slots: [], error: new Error(error.message) };
  }

  const rows = data as { contact_id: string; date: string; start_time: string; end_time: string }[];

  // Group by date -> contact_id -> slots
  const byDate = new Map<string, Map<string, { start: string; end: string }[]>>();
  for (const row of rows) {
    if (!byDate.has(row.date)) byDate.set(row.date, new Map());
    const byContact = byDate.get(row.date)!;
    if (!byContact.has(row.contact_id)) byContact.set(row.contact_id, []);
    byContact.get(row.contact_id)!.push({ start: row.start_time, end: row.end_time });
  }

  const slots: TimeSlot[] = [];

  for (const [date, byContact] of byDate.entries()) {
    // Skip dates where not all selected contacts have availability
    if (!contactIds.every((id) => byContact.has(id))) continue;

    // Compute intersection: latest start time and earliest end time across all contacts
    let overlapStart = "00:00";
    let overlapEnd = "23:59";

    for (const contactId of contactIds) {
      const contactSlots = byContact.get(contactId)!;
      // Use the slot with the earliest start for this contact
      const slot = contactSlots.reduce((a, b) => (a.start <= b.start ? a : b));
      if (slot.start > overlapStart) overlapStart = slot.start;
      if (slot.end < overlapEnd) overlapEnd = slot.end;
    }

    if (overlapStart < overlapEnd) {
      slots.push({
        date,
        startTime: overlapStart.slice(0, 5),
        endTime: overlapEnd.slice(0, 5),
      });
    }
  }

  slots.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

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
    .select("contact_id, date, start_time, end_time")
    .in("contact_id", contactIds);

  if (error) {
    return { slots: [], error: new Error(error.message) };
  }

  const rows = data as { contact_id: string; date: string; start_time: string; end_time: string }[];

  // Group by (date, start_time, end_time), collect all contact_ids per slot
  const slotMap = new Map<string, Set<string>>();
  for (const row of rows) {
    const key = `${row.date}|${row.start_time}|${row.end_time}`;
    if (!slotMap.has(key)) slotMap.set(key, new Set());
    slotMap.get(key)!.add(row.contact_id);
  }

  const slots: UITimeSlot[] = [];
  for (const [key, availableSet] of slotMap.entries()) {
    const [date, startTime, endTime] = key.split("|");
    slots.push({
      id: `slot-${date}-${startTime.replace(":", "")}`,
      date,
      startTime: startTime.slice(0, 5),
      endTime: endTime.slice(0, 5),
      availableFor: Array.from(availableSet),
    });
  }

  slots.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.startTime.localeCompare(b.startTime);
  });

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
