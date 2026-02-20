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

  // Group by (date, start_time, end_time) and count distinct contact_ids
  const slotMap = new Map<string, Set<string>>();
  for (const row of rows) {
    const key = `${row.date}|${row.start_time}|${row.end_time}`;
    if (!slotMap.has(key)) {
      slotMap.set(key, new Set());
    }
    slotMap.get(key)!.add(row.contact_id);
  }

  const slots: TimeSlot[] = [];
  for (const [key, contactSet] of slotMap.entries()) {
    if (contactSet.size === contactIds.length) {
      const [date, startTime, endTime] = key.split("|");
      slots.push({ date, startTime, endTime });
    }
  }

  // Sort by date then startTime
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
