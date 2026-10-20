import { HeaderStatusPill } from "./HeaderStatusPill";

export function PrinterStatusPill() {
  return (
    <HeaderStatusPill
      icon="printer-outline"
      label="Printer belum terhubung"
      tone="success"
    />
  );
}
