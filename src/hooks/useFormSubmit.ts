import { useRef, useState } from "react";

/** Keep the draft mounted on failure and reject double taps synchronously. */
export function useFormSubmit(onError?: (cause: unknown) => void) {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (action: () => Promise<void>) => {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Belum berhasil disimpan. Coba lagi.",
      );
      onError?.(cause);
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return { busy, error, submit };
}
