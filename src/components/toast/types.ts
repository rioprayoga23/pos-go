export type ToastKind = "success" | "error" | "info";

export type AppToastItem = {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
};
