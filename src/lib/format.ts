// Shared tiny formatting helpers for the admin UI.
export const formatIN = (d: Date | string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" }).format(typeof d === "string" ? new Date(d) : d);

export const formatINTime = (d: Date | string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(typeof d === "string" ? new Date(d) : d);

// One rupee formatter for the whole project; it lives with the other money rules.
export { formatINR } from "@/lib/money";

export const formatRelative = (date: Date | string, now = new Date()) => {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "Date unavailable";
  const seconds = Math.round((value.getTime() - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
};

export const humanize = (s: string) => s.replace(/_/g, " ").toLowerCase();
