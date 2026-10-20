import { createContext, useContext, useId, type ReactNode } from "react";

type TabsState = {
  value: string;
  onValueChange: (value: string) => void;
  id: string;
};
const Context = createContext<TabsState | null>(null);
export type RootProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
};
export type TriggerProps = {
  value: string;
  children: ReactNode;
  disabled?: boolean;
};
export function Root({ value, onValueChange, children }: RootProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return <Context value={{ value, onValueChange, id }}>{children}</Context>;
}
export function useTabs() {
  const context = useContext(Context);
  if (!context) throw new Error("Tabs components must be inside Tabs.Root");
  return context;
}
