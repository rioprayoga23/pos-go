import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { AppPressable } from "../components/ui";
import { apiClient, setUnauthorizedHandler } from "../services/apiClient";
import { clearAuthToken, getAuthToken, loadAuthToken, saveAuthToken } from "../services/authToken";
import type { ApiEnvelope } from "../services/apiTypes";
import { useCartStore } from "../store/cartStore";
import { useNotificationStore } from "../store/notificationStore";
import { useProductStore } from "../store/productStore";
import { useStockStore } from "../store/stockStore";
import { useTransactionStore } from "../store/transactionStore";

export type AuthUser = { id: string; username: string; role: "owner" | "pegawai" };
type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const clearLocalSession = useCallback(async () => {
    await clearAuthToken();
    setUser(null);
    queryClient.clear();
    useCartStore.getState().clearCart();
    useStockStore.getState().setItems([]);
    useStockStore.getState().replaceRecipes([]);
    useStockStore.getState().setMovements([]);
    useProductStore.getState().setCatalog([], []);
    useTransactionStore.setState({ orders: [] });
    useNotificationStore.setState({ notifications: [] });
  }, [queryClient]);

  const restore = useCallback(async () => {
    setStatus("loading");
    try {
      const token = await loadAuthToken();
      if (!token) { setUser(null); setStatus("ready"); return; }
      const response = await apiClient.get<ApiEnvelope<AuthUser>>("/auth/me");
      setUser(response.data);
      setStatus("ready");
    } catch (error) {
      if (error instanceof Error && "status" in error && error.status === 401) {
        await clearLocalSession();
        setStatus("ready");
      } else {
        setStatus("error");
      }
    }
  }, [clearLocalSession]);

  useEffect(() => {
    const timeout = setTimeout(() => { void restore(); }, 0);
    return () => clearTimeout(timeout);
  }, [restore]);
  useEffect(() => {
    setUnauthorizedHandler(() => { void clearLocalSession(); });
    return () => setUnauthorizedHandler(null);
  }, [clearLocalSession]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiClient.post<ApiEnvelope<{ token: string; user: AuthUser; expiresAt: string }>>(
      "/auth/login", { username, password },
    );
    await saveAuthToken(response.data.token);
    queryClient.clear();
    setUser(response.data.user);
  }, [queryClient]);

  const logout = useCallback(async () => {
    if (getAuthToken()) {
      try { await apiClient.post<void>("/auth/logout", {}); } catch { /* Local logout still revokes access on this device. */ }
    }
    await clearLocalSession();
  }, [clearLocalSession]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  if (status === "loading") return null;
  if (status === "error") return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text>Sesi belum dapat diverifikasi. Periksa koneksi lalu coba lagi.</Text>
      <AppPressable onPress={() => { void restore(); }} accessibilityRole="button" style={{ padding: 16 }}>
        <Text>Coba lagi</Text>
      </AppPressable>
    </View>
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
