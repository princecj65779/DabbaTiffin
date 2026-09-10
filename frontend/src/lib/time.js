export const IST_TIME_ZONE = "Asia/Kolkata";

export function istDateFromOffset(offset = 0) {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + offset);
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function formatIstTime(date) {
  return date.toLocaleTimeString("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function isBeforeIstCutoff(value, now, fallback) {
  const [hours, minutes] = String(value || "").split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return fallback;

  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const part = (type) => Number(parts.find((item) => item.type === type)?.value);
  const currentMinutes = part("hour") * 60 + part("minute");

  return currentMinutes < hours * 60 + minutes;
}
