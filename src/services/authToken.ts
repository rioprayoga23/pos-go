import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "yosher_auth_token";
let currentToken: string | null = null;

export function getAuthToken() { return currentToken; }

export async function loadAuthToken() {
  currentToken = Platform.OS === "web"
    ? (typeof window === "undefined" ? null : window.sessionStorage.getItem(TOKEN_KEY))
    : await SecureStore.getItemAsync(TOKEN_KEY);
  return currentToken;
}

export async function saveAuthToken(token: string) {
  if (Platform.OS === "web") window.sessionStorage.setItem(TOKEN_KEY, token);
  else await SecureStore.setItemAsync(TOKEN_KEY, token);
  currentToken = token;
}

export async function clearAuthToken() {
  currentToken = null;
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
