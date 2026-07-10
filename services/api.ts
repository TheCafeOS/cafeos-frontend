import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401
    ) {
      localStorage.removeItem("token");

      const currentPath =
        window.location.pathname + window.location.search;

      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace(
          `/login?redirect=${encodeURIComponent(currentPath)}`,
        );
      }
    }

    return Promise.reject(error);
  },
);

export default api;