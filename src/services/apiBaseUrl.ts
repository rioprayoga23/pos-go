function developmentHost(hostUri: string | null | undefined): string | null {
  if (!hostUri) return null;
  try {
    const hostname = new URL(hostUri.includes("://") ? hostUri : `http://${hostUri}`).hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") return hostname;
    if (/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return hostname;
    if (hostname.endsWith(".local")) return hostname;
  } catch { /* A tunnel URL cannot expose the local API port. */ }
  return null;
}

export function resolveApiBaseUrl(
  configuredUrl: string | undefined,
  nativeUrl: string | undefined,
  platform: string,
  isDevelopment: boolean,
  expoHostUri?: string | null,
) {
  const value = (platform === "web" ? configuredUrl : nativeUrl || configuredUrl)?.trim();
  if (!value) return null;
  const baseUrl = value.replace(/\/+$/, "");
  if (platform === "web" || !isDevelopment) return baseUrl;

  const localApi = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?=\/|$)/i;
  if (!localApi.test(baseUrl)) return baseUrl;

  const host = developmentHost(expoHostUri);
  // Android's own localhost is the emulator/device. Its emulator reaches the
  // developer machine through 10.0.2.2 when Expo only reports localhost.
  const apiHost = host && host !== "localhost" && host !== "127.0.0.1"
    ? host
    : platform === "android" ? "10.0.2.2" : null;
  return apiHost ? baseUrl.replace(localApi, `http://${apiHost}$2`) : baseUrl;
}
