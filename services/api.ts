import axios, {
  AxiosError,
    InternalAxiosRequestConfig,
} from "axios";
import {
  clearAuth,
  getAuthSnapshot,
  getRefreshToken,
  isAuthIdentityCurrentFor,
  isLogoutPending,
  saveRefreshedTokens,
} from "@/utils/auth";
import {
  isAuthSnapshotCurrent,
} from "@/utils/auth-persistence.mjs";
import { createSingleFlight } from "@/utils/single-flight.mjs";
import { createCrossTabRefresh } from "@/utils/cross-tab-refresh.mjs";
import {
  disconnectSocket,
  synchronizeSocketAuth,
} from "@/lib/socket";

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _authGeneration?: string | null;
  _authEmployeeId?: string | null;
}

interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const runSingleRefresh = createSingleFlight();
const runCrossTabRefresh = createCrossTabRefresh<string>(
  () => typeof navigator !== "undefined" ? navigator.locks : null,
  () => typeof window !== "undefined" ? window.localStorage : null,
);

const clearAuthAndRedirect = async () => {
  if (typeof window === "undefined") return;

  await clearAuth();

  const currentPath =
    window.location.pathname + window.location.search;

  if (!window.location.pathname.startsWith("/login")) {
    window.location.replace(
      `/login?redirect=${encodeURIComponent(currentPath)}`
    );
  }
};

api.interceptors.request.use(
  (rawConfig: InternalAxiosRequestConfig) => {
    const config = rawConfig as RetryAxiosRequestConfig;
    if (typeof window !== "undefined") {
      if (isLogoutPending()) {
        return Promise.reject(
          new Error("Authentication is being cleared."),
        );
      }

      const current = getAuthSnapshot();
      if (config._authGeneration !== undefined) {
        if (
          !current ||
          current.generation !== config._authGeneration ||
          current.employeeId !== config._authEmployeeId
        ) {
          return Promise.reject(
            new Error("Authentication changed before the request was retried."),
          );
        }
      } else if (current) {
        config._authGeneration = current.generation;
        config._authEmployeeId = current.employeeId;
      }

      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    const isRefreshRequest =
      originalRequest.url?.includes("/api/v1/auth/refresh") ||
      originalRequest.url?.includes("/auth/refresh");

    if (status !== 401 || isRefreshRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      void clearAuthAndRedirect();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const snapshot = getAuthSnapshot();
    if (
      !snapshot ||
      isLogoutPending() ||
      originalRequest._authGeneration !== snapshot.generation ||
      originalRequest._authEmployeeId !== snapshot.employeeId
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      void clearAuthAndRedirect();
      return Promise.reject(error);
    }

    try {
      const newAccessToken = await runSingleRefresh(async () => {
        try {
          return await runCrossTabRefresh(snapshot, async (expected) => {
            const response = await axios.post<RefreshResponse>(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
              { refreshToken },
              {
                headers: { "Content-Type": "application/json" },
                timeout: 10000,
              },
            );

            const {
              accessToken,
              refreshToken: nextRefreshToken,
            } = response.data.data;
            saveRefreshedTokens(
              { accessToken, refreshToken: nextRefreshToken },
              expected,
            );
            return accessToken;
          });
        } catch (refreshError) {
          if (isAuthSnapshotCurrent(window.localStorage, snapshot)) {
            await clearAuthAndRedirect();
          }
          throw refreshError;
        }
      });

      if (!isAuthIdentityCurrentFor(snapshot)) {
        throw new Error("Authentication changed during refresh.");
      }

      synchronizeSocketAuth(newAccessToken);
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

if (typeof window !== "undefined") {
  const syncSocketAfterAuthChange = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key !== null &&
      !["accessToken", "authGeneration", "logoutPending"].includes(event.key)
    ) {
      return;
    }

    if (isLogoutPending()) {
      disconnectSocket();
    } else {
      synchronizeSocketAuth(localStorage.getItem("accessToken"));
    }
  };

  window.addEventListener("storage", syncSocketAfterAuthChange);
  window.addEventListener(
    "cafeos-auth-state-changed",
    syncSocketAfterAuthChange,
  );
}

export default api;