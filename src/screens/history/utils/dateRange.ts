import type { DateRange } from "../types";
import { formatDateKey, getLocalDateKey } from "../../../utils/date";

export function formatDateRangeLabel(range: DateRange) {
  if (range.startDate === range.endDate) {
    const prefix = range.startDate === getLocalDateKey() ? "Hari Ini, " : "";
    return `${prefix}${formatDateKey(range.startDate)}`;
  }

  return `${formatDateKey(range.startDate)} – ${formatDateKey(range.endDate)}`;
}
