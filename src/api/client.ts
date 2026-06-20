// src/api/client.ts
// HTTP client for the ISTA-GOMA backend API.
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api"
const TOKEN_KEY = "fino_token"

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }
  
  // Ensure we don't send "undefined" or "null" as string
  if (token && token !== "undefined" && token !== "null") {
    headers["Authorization"] = `Bearer ${token}`
  }

  console.log(`[API] Request: ${method} ${path}`, body || "")
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  if (!res.ok) {
    console.error(`[API] Error ${res.status} on ${method} ${path}`)
    let errorMsg = `HTTP ${res.status} ${res.statusText}`
    let errorBody: any
    try {
      // Try to get JSON error first
      const clone = res.clone()
      errorBody = await clone.json()
      errorMsg = errorBody.error || errorBody.message || errorBody.err || errorMsg
    } catch {
      try {
        errorBody = await res.text()
        if (errorBody && errorBody.length < 200) errorMsg = errorBody
      } catch {
        errorBody = null
      }
    }
    throw new ApiError(res.status, errorMsg, errorBody)
  }

  if (res.status === 204) return undefined as T

  let envelope: any
  try {
    const text = await res.text()
    if (!text) return undefined as T
    envelope = JSON.parse(text)
  } catch {
    return null as unknown as T
  }
  
  if (envelope && envelope.success === false) {
    throw new ApiError(res.status, envelope.error || envelope.message || "Request failed", envelope)
  }

  if (envelope && envelope.data !== undefined) return envelope.data
  return envelope as unknown as T
}

export const api = {
  get:    <T>(path: string, signal?: AbortSignal) => request<T>("GET",    path, undefined, signal),
  post:   <T>(path: string, body: unknown)         => request<T>("POST",   path, body),
  put:    <T>(path: string, body: unknown)         => request<T>("PUT",    path, body),
  patch:  <T>(path: string, body: unknown)         => request<T>("PATCH",  path, body),
  delete: <T>(path: string)                        => request<T>("DELETE", path),
}
