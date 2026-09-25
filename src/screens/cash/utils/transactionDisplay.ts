import type { CashTransaction } from "../../../types/cash";
import { dateFromKey, formatDateKey } from "../../../utils/date";

export function getCashSourceLabel(source: CashTransaction["source"]) {
  return source === "cash"
    ? "Kas Laci (Pay-out)"
    : "Rekening Usaha (Transfer)";
}

export function getCashDateLabel(dateKey: string, time: string) {
  const dateLabel =
    dateKey === "2024-10-24"
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
