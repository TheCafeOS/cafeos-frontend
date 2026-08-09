import {
  DAY_KEYS,
  type DayKey,
  type OpeningHours,
} from "@/types/opening-hours";

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);

  const suffix = hours >= 12 ? "PM" : "AM";

  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(
    2,
    "0",
  )} ${suffix}`;
}

function getDayKey(dayIndex: number): DayKey {
  // JavaScript:
  // Sunday = 0
  // Monday = 1
  // ...
  // Saturday = 6

  return DAY_KEYS[(dayIndex + 6) % 7];
}

function isOvernight(
  open: string,
  close: string,
): boolean {
  return timeToMinutes(close) < timeToMinutes(open);
}

export type RestaurantOpenStatus = {
  isOpen: boolean;
  message: string;
};

export function getRestaurantOpenStatus(
  openingHours: OpeningHours | null | undefined,
  now = new Date(),
): RestaurantOpenStatus {
  if (!openingHours) {
    return {
      isOpen: false,
      message: "Hours not available",
    };
  }

  const currentDayIndex = now.getDay();

  const currentDay = getDayKey(currentDayIndex);

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const currentSchedule = openingHours[currentDay];

  /*
   * First check whether we're inside yesterday's
   * overnight schedule.
   *
   * Example:
   *
   * Monday 18:00 → 02:00
   *
   * Tuesday 01:00 is still OPEN because Monday's
   * schedule has not finished yet.
   */

  const previousDayIndex =
    (currentDayIndex + 6) % 7;

  const previousDay =
    getDayKey(previousDayIndex);

  const previousSchedule =
    openingHours[previousDay];

  if (
    previousSchedule?.isOpen &&
    previousSchedule.open &&
    previousSchedule.close &&
    isOvernight(
      previousSchedule.open,
      previousSchedule.close,
    ) &&
    currentMinutes <
      timeToMinutes(previousSchedule.close)
  ) {
    return {
      isOpen: true,
      message: `Closes at ${formatTime(
        previousSchedule.close,
      )}`,
    };
  }

  /*
   * Check today's normal / overnight schedule.
   */

  if (
    currentSchedule?.isOpen &&
    currentSchedule.open &&
    currentSchedule.close
  ) {
    const openMinutes =
      timeToMinutes(currentSchedule.open);

    const closeMinutes =
      timeToMinutes(currentSchedule.close);

    /*
     * Normal schedule:
     *
     * 09:00 → 23:00
     */

    if (closeMinutes > openMinutes) {
      if (
        currentMinutes >= openMinutes &&
        currentMinutes < closeMinutes
      ) {
        return {
          isOpen: true,
          message: `Closes at ${formatTime(
            currentSchedule.close,
          )}`,
        };
      }
    }

    /*
     * Overnight schedule:
     *
     * 18:00 → 02:00
     */

    else if (closeMinutes < openMinutes) {
      if (currentMinutes >= openMinutes) {
        return {
          isOpen: true,
          message: `Closes at ${formatTime(
            currentSchedule.close,
          )}`,
        };
      }
    }
  }

  /*
   * Restaurant is currently closed.
   *
   * Find the next opening day.
   */

  for (let offset = 0; offset < 7; offset++) {
    const dayIndex =
      (currentDayIndex + offset) % 7;

    const day = getDayKey(dayIndex);

    const schedule = openingHours[day];

    if (
      !schedule?.isOpen ||
      !schedule.open
    ) {
      continue;
    }

    /*
     * Today, but before opening time.
     */

    if (offset === 0) {
      const openMinutes =
        timeToMinutes(schedule.open);

      if (currentMinutes < openMinutes) {
        return {
          isOpen: false,
          message: `Opens today at ${formatTime(
            schedule.open,
          )}`,
        };
      }

      continue;
    }

    /*
     * Future day.
     */

    return {
      isOpen: false,
      message: `Opens ${DAY_LABELS[day]} at ${formatTime(
        schedule.open,
      )}`,
    };
  }

  return {
    isOpen: false,
    message: "Closed",
  };
}