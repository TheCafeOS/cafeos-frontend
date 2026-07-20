import { disconnectSocket } from "@/lib/socket";

import type { AuthEmployee } from "@/types/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const EMPLOYEE_KEY = "employee";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getEmployee(): AuthEmployee | null {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(EMPLOYEE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthEmployee;
  } catch {
    return null;
  }
}

export function isOwner(): boolean {
  return getEmployee()?.role === "OWNER";
}

export function isManager(): boolean {
  return getEmployee()?.role === "MANAGER";
}

export function saveAuth(data: {
  accessToken: string;
  refreshToken: string;
  employee: AuthEmployee;
}) {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(data.employee));
}

export function clearAuth() {
  disconnectSocket();

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EMPLOYEE_KEY);
}