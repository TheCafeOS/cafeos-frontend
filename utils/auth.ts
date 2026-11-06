import { disconnectSocket } from "@/lib/socket";
import {
  clearAuthState,
  invalidateAuthState,
  isAuthIdentityCurrent,
  readAuthSnapshot,
  persistAuth,
  persistTokens,
} from "@/utils/auth-persistence.mjs";
import { withAuthStateLock } from "@/utils/auth-state-lock.mjs";

import type { AuthEmployee } from "@/types/auth.types";
import type { AuthSnapshot } from "@/utils/auth-persistence.mjs";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const EMPLOYEE_KEY = "employee";
const AUTH_STATE_CHANGED_EVENT = "cafeos-auth-state-changed";

function getLockManager() {
  return typeof navigator !== "undefined" ? navigator.locks : null;
}

export function notifyAuthStateChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
  }
}

export function getAuthSnapshot(): AuthSnapshot | null {
  if (typeof window === "undefined") return null;
  return readAuthSnapshot(localStorage);
}

export function isAuthIdentityCurrentFor(snapshot: AuthSnapshot): boolean {
  return typeof window !== "undefined" &&
    isAuthIdentityCurrent(localStorage, snapshot);
}

export function isLogoutPending(): boolean {
  return typeof window !== "undefined" &&
    localStorage.getItem("logoutPending") === "true";
}

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

export async function saveAuth(data: {
  accessToken: string;
  refreshToken: string;
  employee: AuthEmployee;
}) {
  if (typeof window === "undefined") return;
  await withAuthStateLock(getLockManager, () => {
    persistAuth(localStorage, data);
    notifyAuthStateChanged();
  });
}

export function saveRefreshedTokens(data: {
  accessToken: string;
  refreshToken: string;
}, snapshot: AuthSnapshot) {
  if (typeof window === "undefined") {
    throw new Error("Authentication storage is unavailable.");
  }
  persistTokens(localStorage, data, snapshot);
  notifyAuthStateChanged();
}

export function beginAuthLogout() {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }
  const credentials = getCurrentAuthTokens();
  invalidateAuthState(localStorage);
  notifyAuthStateChanged();
  return credentials;
}

export function getCurrentAuthTokens() {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  };
}

export function clearAuthWithinLock() {
  if (typeof window === "undefined") return;
  disconnectSocket();
  clearAuthState(localStorage);
  notifyAuthStateChanged();
}

export function runWithAuthStateLock<T>(
  operation: () => Promise<T> | T,
): Promise<T> {
  return withAuthStateLock(getLockManager, operation);
}

export async function clearAuth() {
  if (typeof window === "undefined") return;
  invalidateAuthState(localStorage);
  notifyAuthStateChanged();
  await withAuthStateLock(getLockManager, clearAuthWithinLock);
}