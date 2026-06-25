export function toDateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function getTimezoneParts(date: Date, timezone: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second")
  };
}

export function zonedTimeToUtcIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string
): string {
  const candidate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const actual = formatter.formatToParts(candidate);

  const actualYear = Number(actual.find((part) => part.type === "year")?.value ?? "0");
  const actualMonth = Number(actual.find((part) => part.type === "month")?.value ?? "0");
  const actualDay = Number(actual.find((part) => part.type === "day")?.value ?? "0");
  const actualHour = Number(actual.find((part) => part.type === "hour")?.value ?? "0");
  const actualMinute = Number(actual.find((part) => part.type === "minute")?.value ?? "0");

  const desiredUtcMs =
    candidate.getTime() +
    ((year - actualYear) * 24 * 60 +
      (month - actualMonth) * 31 * 24 * 60 +
      (day - actualDay) * 24 * 60 +
      (hour - actualHour) * 60 +
      (minute - actualMinute)) *
      60_000;

  return new Date(desiredUtcMs).toISOString();
}

export function minutesSinceMidnight(date: Date, timezone: string): number {
  const parts = getTimezoneParts(date, timezone);
  return parts.hour * 60 + parts.minute;
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}
