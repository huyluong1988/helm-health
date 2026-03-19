export type AuthUser = { id: number; name: string };

const API_BASE_URL = "";

export const tokenKey = "helmHealthToken";

export function getToken(): string | null {
  return localStorage.getItem(tokenKey);
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem(tokenKey);
  else localStorage.setItem(tokenKey, token);
}

type ApiError = { error?: string };

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  const body = (await res.json().catch(() => ({}))) as ApiError & T;
  if (!res.ok) {
    throw new Error(body?.error || `Request failed: ${res.status}`);
  }
  return body as T;
}

export async function loginDummy(name: string): Promise<AuthUser & { token: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  const data = (await res.json()) as { token?: string; user?: AuthUser; error?: string };
  if (!res.ok) throw new Error(data?.error || `Login failed: ${res.status}`);

  if (!data.token || !data.user) {
    throw new Error("Login response was missing token/user");
  }

  setToken(data.token);
  return { ...data.user, token: data.token };
}

export async function getMe(): Promise<AuthUser> {
  const data = await apiFetch<{ user: AuthUser }>("/api/auth/me");
  return data.user;
}

