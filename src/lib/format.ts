// Shared tiny formatting helpers for the admin UI.
export const formatIN = (d: Date | string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" }).format(typeof d === "string" ? new Date(d) : d);

export const formatINTime = (d: Date | string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(typeof d === "string" ? new Date(d) : d);

export const formatINR = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: paise % 100 === 0 ? 0 : 2 }).format(paise / 100);

export const humanize = (s: string) => s.replace(/_/g, " ").toLowerCase();
