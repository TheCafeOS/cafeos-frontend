import axios from "axios";
import api from "@/services/api";
import {
  beginAuthLogout,
  clearAuthWithinLock,
  getCurrentAuthTokens,
  runWithAuthStateLock,
  notifyAuthStateChanged,
} from "@/utils/auth";

import type {
  ApiSuccessResponse,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RestaurantRegistrationData,
  RestaurantRegistrationPayload,
  AuthSession,
  LogoutAllResponse,
} from "@/types/auth.types";

type LogoutResponse = ApiSuccessResponse<null>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
let pendingLogout: Promise<boolean> | null = null;

export async function registerRestaurant(
  payload: RestaurantRegistrationPayload,
): Promise<RestaurantRegistrationData> {
  const response = await api.post<
    ApiSuccessResponse<RestaurantRegistrationData>
  >("/api/v1/auth/register", payload);

  return response.data.data;
}

export async function loginOwner(
  payload: LoginRequest,
): Promise<LoginResponse> {
  const response = await api.post<ApiSuccessResponse<LoginResponse>>(
    "/api/v1/auth/login",
    payload,
  );

  return response.data.data;
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<void> {
  await api.patch<ApiSuccessResponse<null>>(
    "/api/v1/auth/change-password",
    payload,
  );
}

export async function logoutCurrentSession(): Promise<boolean> {
  if (pendingLogout) return pendingLogout;

  const credentials = beginAuthLogout();
  const logoutOperation = async () => {
    let serverRevoked = false;
    try {
      const current = getCurrentAuthTokens();
      if (
        credentials.accessToken &&
        current.accessToken === credentials.accessToken &&
        current.refreshToken === credentials.refreshToken
      ) {
        await axios.post<ApiSuccessResponse<null>, { data: LogoutResponse }>(
          `${API_BASE_URL}/api/v1/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${credentials.accessToken}`,
            },
            timeout: 10000,
          },
        );
        serverRevoked = true;
      }
    } catch {
      serverRevoked = false;
    } finally {
      const current = getCurrentAuthTokens();
      if (
        current.accessToken === credentials.accessToken &&
        current.refreshToken === credentials.refreshToken
      ) {
        clearAuthWithinLock();
      }
    }

    return serverRevoked;
  };

  pendingLogout = runWithAuthStateLock(logoutOperation)
    .catch(() => {
      const current = getCurrentAuthTokens();
      if (
        current.accessToken === credentials.accessToken &&
        current.refreshToken === credentials.refreshToken
      ) {
        clearAuthWithinLock();
      }
      return false;
    })
    .finally(() => {
      notifyAuthStateChanged();
    pendingLogout = null;
  });

  return pendingLogout;
}

export async function getAuthSessions(): Promise<AuthSession[]> {
  const response = await api.get<ApiSuccessResponse<AuthSession[]>>(
    "/api/v1/auth/sessions",
  );
  return response.data.data;
}

export async function revokeAuthSession(sessionId: string): Promise<void> {
  await api.delete<ApiSuccessResponse<null>>(
    `/api/v1/auth/sessions/${encodeURIComponent(sessionId)}`,
  );
}

export async function logoutAllSessions(): Promise<LogoutAllResponse> {
  const response = await api.post<ApiSuccessResponse<LogoutAllResponse>>(
    "/api/v1/auth/logout-all",
  );
  return response.data.data;
}