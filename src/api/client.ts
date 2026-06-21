// src/api/client.ts
// HTTP client for the ISTA-GOMA backend API.
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";
const TOKEN_KEY = "fino_token";

export class ApiError extends Error {
  public isNetwork?: boolean;
  public isGateway?: boolean;
  public url?: string;

  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const GATEWAY_STATUSES = new Set([502, 503, 504]);

function isGatewayMessage(message: string) {
  const lower = (message || "").toLowerCase();
  return (
    lower.includes("bad gateway") ||
    lower.includes("gateway timeout") ||
    lower.includes("upstream") ||
    lower.includes("proxy")
  );
}

function gatewayHelpMessage() {
  return (
    "Le serveur de passerelle (proxy) ne répond pas. " +
    "Vérifiez que l'API backend est démarrée et que la cible du proxy est correcte (VITE_API_TARGET), puis redémarrez le serveur frontend."
  );
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Ensure we don't send "undefined" or "null" as string
  if (token && token !== "undefined" && token !== "null") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${path}`;
  console.log(`[API] Request: ${method} ${url}`, body || "");
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      credentials: "include",
      // ensure fetch uses CORS mode (defaults to 'cors' in browsers) and no-cache to avoid stale responses
      mode: "cors",
      cache: "no-store",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err: unknown) {
    // Network or CORS error
    console.error(`[API] Network error on ${method} ${url}`, err);
    const message = err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();

    const apiErr = new ApiError(
      0,
      lower.includes("failed to fetch") || lower.includes("networkerror")
        ? gatewayHelpMessage()
        : `Network error: ${message}`,
      err,
    );

    apiErr.isNetwork = true;
    apiErr.isGateway =
      lower.includes("failed to fetch") ||
      lower.includes("networkerror") ||
      lower.includes("proxy") ||
      lower.includes("gateway");
    apiErr.url = url;

    throw apiErr;
  }

  if (!res.ok) {
    console.error(`[API] Error ${res.status} on ${method} ${url}`);
    let errorMsg = `HTTP ${res.status} ${res.statusText}`;
    let errorBody: unknown;

    try {
      // Try to get JSON error first
      const clone = res.clone();
      errorBody = await clone.json();
      errorMsg =
        errorBody.error || errorBody.message || errorBody.err || errorMsg;
    } catch {
      try {
        errorBody = await res.text();
        if (errorBody && errorBody.length < 200) errorMsg = errorBody;
      } catch {
        errorBody = null;
      }
    }

    const isGateway =
      GATEWAY_STATUSES.has(res.status) || isGatewayMessage(errorMsg);

    const finalMessage = isGateway ? gatewayHelpMessage() : errorMsg;
    const apiErr = new ApiError(res.status, finalMessage, errorBody);
    apiErr.isGateway = isGateway;
    apiErr.url = url;

    throw apiErr;
  }

  if (res.status === 204) return undefined as T;

  let envelope: unknown;
  try {
    const text = await res.text();
    if (!text) return undefined as T;
    envelope = JSON.parse(text);
  } catch {
    return null as unknown as T;
  }

  if (
    envelope &&
    typeof envelope === "object" &&
    "success" in envelope &&
    (envelope as { success?: boolean }).success === false
  ) {
    const e = envelope as { error?: string; message?: string };
    throw new ApiError(
      res.status,
      e.error || e.message || "Request failed",
      envelope,
    );
  }

  if (envelope && typeof envelope === "object" && "data" in envelope) {
    return (envelope as { data: T }).data;
  }

  return envelope as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) =>
    request<T>("GET", path, undefined, signal),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
