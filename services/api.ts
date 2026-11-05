import axios, {
  AxiosError,
    InternalAxiosRequestConfig,
} from "axios";
import {
  clearAuth,
  getEmployee,
  getRefreshToken,
  saveRefreshedTokens,
} from "@/utils/auth";
import { createSingleFlight } from "@/utils/single-flight.mjs";
import { createCrossTabRefresh } from "@/utils/cross-tab-refresh.mjs";
import { synchronizeSocketAuth } from "@/lib/socket";

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
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

const runSingleRefresh = createSingleFlight(() => clearAuthAndRedirect());
const runCrossTabRefresh = createCrossTabRefresh<string>(
  () => typeof navigator !== "undefined" ? navigator.locks : null,
  () => typeof window !== "undefined" ? window.localStorage : null,
  () => getEmployee()?.id ?? null,
);

const clearAuthAndRedirect = () => {
  if (typeof window === "undefined") return;

  clearAuth();

  const currentPath =
    window.location.pathname + window.location.search;

  if (!window.location.pathname.startsWith("/login")) {
    window.location.replace(
      `/login?redirect=${encodeURIComponent(currentPath)}`
    );
  }
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
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
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    const employeeId = getEmployee()?.id ?? null;

    if (!refreshToken) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    try {
      const newAccessToken = await runSingleRefresh(() =>
        runCrossTabRefresh(
          refreshToken,
          employeeId,
          async () => {
            const response = await axios.post<RefreshResponse>(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
              {
                refreshToken,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
                timeout: 10000,
              }
            );

            const {
              accessToken,
              refreshToken: nextRefreshToken,
            } = response.data.data;
            saveRefreshedTokens({
              accessToken,
              refreshToken: nextRefreshToken,
            });
            return accessToken;
          },
        ),
      );

      synchronizeSocketAuth(newAccessToken);
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;