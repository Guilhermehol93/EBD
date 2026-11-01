import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatDatePtBR(dateString: string | Date, pattern: string = "dd/MM/yyyy"): string {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, pattern, { locale: ptBR });
  } catch (err) {
    return String(dateString);
  }
}

export function formatDateTimePtBR(dateString: string | Date): string {
  return formatDatePtBR(dateString, "dd/MM/yyyy 'às' HH:mm");
}

/** Format an ISO timestamp as a datetime-local value in the church timezone. */
export function formatSaoPauloDateTimeLocal(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Convert a datetime-local value representing church time into an absolute timestamp. */
export function saoPauloDateTimeLocalToISOString(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Informe uma data e horário válidos.");

  const [, year, month, day, hour, minute] = match;
  const desiredWallTime = Date.UTC(+year, +month - 1, +day, +hour, +minute);
  let timestamp = desiredWallTime;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  // Resolve the timezone offset from IANA data instead of relying on the
  // server/browser timezone or a hardcoded offset.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = formatter.formatToParts(new Date(timestamp));
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    const representedWallTime = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute")
    );
    const adjustedTimestamp = desiredWallTime - (representedWallTime - timestamp);
    if (adjustedTimestamp === timestamp) break;
    timestamp = adjustedTimestamp;
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) throw new Error("Informe uma data e horário válidos.");
  return date.toISOString();
}

export function formatDateLongPtBR(dateString: string | Date): string {
  return formatDatePtBR(dateString, "dd 'de' MMMM 'de' yyyy");
}

export function getNextSunday(): Date {
  const d = new Date();
  const day = d.getDay(); // 0 is Sunday
  const diff = (7 - day) % 7;
  const nextSunday = new Date(d);
  nextSunday.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  nextSunday.setHours(8, 0, 0, 0); // Default to 8:00 AM on Sunday
  return nextSunday;
}

export function getPublicAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
