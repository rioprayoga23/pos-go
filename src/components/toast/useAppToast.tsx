import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ToastViewport } from "./ToastViewport";
import type { AppToastItem, ToastKind } from "./types";

type AppToastContextValue = {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);
const toastDuration = 4200;
const maximumVisibleToasts = 4;

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const show = useCallback((kind: ToastKind, title: string, description?: string) => {
    const item = { id: ++nextId.current, kind, title, description };
    setItems((current) => [item, ...current].slice(0, maximumVisibleToasts));
  }, []);

  const value = useMemo<AppToastContextValue>(
    () => ({
      success: (title, description) => show("success", title, description),
      error: (title, description) => show("error", title, description),
      info: (title, description) => show("info", title, description),
    }),
    [show],
  );

  return (
    <AppToastContext.Provider value={value}>
      <>
        {children}
        <ToastViewport items={items} onDismiss={dismiss} duration={toastDuration} />
      </>
    </AppToastContext.Provider>
  );
}

/** Shared action feedback for web, iOS, and Android. */
export function useAppToast() {
  const toast = useContext(AppToastContext);
  if (!toast) {
    throw new Error("useAppToast must be used inside AppToastProvider");
  }
  return toast;
}
