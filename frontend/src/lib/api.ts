import { API_BASE_URL } from "../config";
import { getToken } from "./auth";

function extractErrorMessage(payload: any): string {
  // FastAPI normalmente: { detail: "..." } o { detail: {...} }
  const detail = payload?.detail ?? payload;

  if (typeof detail === "string") return detail;

  // Tu formato: { detail: { message, invalid: [...] } }
  if (detail?.message) {
    const invalid = Array.isArray(detail.invalid) ? detail.invalid : [];
    const firstErr = invalid?.[0]?.errors?.[0];
    if (firstErr?.message) {
      return `${detail.message} (${firstErr.code}: ${firstErr.message})`;
    }
    return detail.message;
  }

  return "Request failed";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {};
  const isFormData = options.body instanceof FormData;

  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // ✅ URL final (esto reemplaza el "url" inexistente)
  const requestUrl = `${API_BASE_URL}${path}`;

  // ✅ logs temporales
  console.log("API_BASE_URL =", API_BASE_URL);
  console.log("REQUEST =", {
    method: options.method ?? "GET",
    url: requestUrl,
    isFormData,
  });

  const res = await fetch(requestUrl, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const payload = await res.json();
      throw new Error(extractErrorMessage(payload));
    }

    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return (await res.text()) as any;
  }

  return (await res.json()) as T;
}
