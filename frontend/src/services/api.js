/**
 * Thin fetch wrapper shared by every service module.
 *
 * Centralizes: base URL, JSON headers, bearer authentication,
 * timeouts, and turning non-2xx responses into a consistent ApiError so
 * every page can handle failures the same way.
 */
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${import.meta.env.VITE_API_URL || "https://task-maanager-basecamp-1.onrender.com"}/api`;
const DEFAULT_TIMEOUT_MS = 10000;
import { getToken, removeToken } from "../utils/auth";

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(
  path,
  { method = "GET", body, params, timeout = DEFAULT_TIMEOUT_MS } = {},
) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    const token = getToken();
    response = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new ApiError(
        "The request took too long and was cancelled. Check that the backend is running.",
        {
          code: "timeout",
        },
      );
    }
    throw new ApiError(
      "Could not reach the server. Check your network connection and that the backend is running.",
      {
        code: "network_error",
      },
    );
  }
  clearTimeout(timer);

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body (e.g. empty response) — leave data as null
  }

  if (!response.ok) {
    if (response.status === 401) removeToken();
    throw new ApiError(data?.message || "Something went wrong.", {
      status: response.status,
      code: data?.code || "unknown_error",
      details: data?.details,
    });
  }

  return data;
}

export const api = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  del: (path) => request(path, { method: "DELETE" }),
};
