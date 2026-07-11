export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}