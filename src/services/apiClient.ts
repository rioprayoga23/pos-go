type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiRoot() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!baseUrl) {
    throw new ApiError("URL API belum diatur.", 0, "api_url_missing");
  }
  return `${baseUrl.replace(/\/+$/, "")}/api/v1`;
}

type QueryParamValue = string | number | boolean | null | undefined;

export function buildQueryString(
  values: Readonly<Record<string, QueryParamValue>>,
) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  if (body !== undefined) headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    const endpoint = path.startsWith("/") ? path : `/${path}`;
    response = await fetch(`${getApiRoot()}${endpoint}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError("Tidak dapat terhubung ke server.", 0, "network_error");
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null) as ApiErrorBody | null;
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message ?? "Permintaan tidak dapat diproses.",
      response.status,
      payload?.error?.code,
    );
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string, signal?: AbortSignal) {
    return request<T>("GET", path, undefined, signal);
  },
  post<T>(path: string, body: unknown) {
    return request<T>("POST", path, body);
  },
  patch<T>(path: string, body: unknown) {
    return request<T>("PATCH", path, body);
  },
  delete(path: string) {
    return request<void>("DELETE", path);
  },
};
