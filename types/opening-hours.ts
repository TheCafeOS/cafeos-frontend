export const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DayKey = (typeof DAY_KEYS)[number];

export type OpeningHoursDay = {
  isOpen: boolean;
  open: string | null;
  close: string | null;
};

export type OpeningHours = Record<DayKey, OpeningHoursDay>;