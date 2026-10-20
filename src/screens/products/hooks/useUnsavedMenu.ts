import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useNavigation, usePreventRemove } from "expo-router/react-navigation";

export function useUnsavedMenu(dirty: boolean, busy: boolean) {
  const navigation = useNavigation();
  const [released, setReleased] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  usePreventRemove((dirty || busy) && !released, ({ data }) => {
    if (!busy) setPending(() => () => navigation.dispatch(data.action));
  });
  const dispatched = useRef(false);
  useEffect(() => {
    if (released && pending && !dispatched.current) {
      dispatched.current = true;
      pending();
    }
  }, [released, pending]);
  useEffect(() => {
    if (Platform.OS !== "web" || !dirty || released) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty, released]);
  return {
    pending: released ? null : pending,
    requestLeave: (action: () => void) => {
      if (busy) return;
      if (dirty) setPending(() => action);
      else action();
    },
    cancelLeave: () => setPending(null),
    discard: () => setReleased(true),
    finishAndLeave: (action: () => void) => {
      setPending(() => action);
      setReleased(true);
    },
  };
}
