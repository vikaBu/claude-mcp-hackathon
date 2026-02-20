import type { TimeSlot } from "@/types/meetup";

export const mockTimeSlots: TimeSlot[] = [
  {
    id: "ts1",
    date: "2026-02-21",
    startTime: "18:00",
    endTime: "20:00",
    availableFor: ["c1", "c2", "c4", "c6"],
  },
  {
    id: "ts2",
    date: "2026-02-22",
    startTime: "19:00",
    endTime: "21:00",
    availableFor: ["c1", "c2", "c3", "c4", "c5", "c6"],
  },
  {
    id: "ts3",
    date: "2026-02-23",
    startTime: "12:00",
    endTime: "14:00",
    availableFor: ["c2", "c3", "c5"],
  },
  {
    id: "ts4",
    date: "2026-02-24",
    startTime: "18:30",
    endTime: "20:30",
    availableFor: ["c1", "c3", "c4", "c5", "c6"],
  },
];
