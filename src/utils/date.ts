import type { DatePeriodPreset, DateRange } from "../types/dateRange";

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPresetDateRange(
  referenceDateKey: string,
  period: DatePeriodPreset,
): DateRange {
  if (period === "today") {
    return { startDate: referenceDateKey, endDate: referenceDateKey };
  }

  const date = dateFromKey(referenceDateKey);
  const year = date.getFullYear();
  const month = date.getMonth();
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    new Date(year, month + 1, 0).getDate(),
  ).padStart(2, "0")}`;
  return { startDate, endDate };
}

export function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function formatDateKey(dateKey: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dateFromKey(dateKey));
}
