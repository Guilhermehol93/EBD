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
