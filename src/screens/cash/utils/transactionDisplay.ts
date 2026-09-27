import { dateFromKey, formatDateKey, getLocalDateKey } from "../../../utils/date";

export function getCashDateLabel(dateKey: string, time: string) {
  const dateLabel = dateKey === getLocalDateKey()
    ? "Hari ini"
    : new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
      }).format(dateFromKey(dateKey));
  return `${dateLabel}, ${time} WIB`;
}

export function getCashDateTimeLabel(dateKey: string, time: string) {
  return `${formatDateKey(dateKey)}, ${time} WIB`;
}
