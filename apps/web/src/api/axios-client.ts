import axios from "axios";
import { getAuthToken, useAuthStore } from "@/features/auth/store";
import { PATHS } from "@/router/paths";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// AI generation (summaries, reports, triage) is inherently slow — it can take
// 8–15s+ on a single request, and the backend retries on rate-limits with
// backoff. The default 10s timeout is too tight for these calls, so they use
// this dedicated, much longer timeout.
export const AI_REQUEST_TIMEOUT = 180000;

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getAuthToken()) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== PATHS.LOGIN) {
        window.location.assign(PATHS.LOGIN);
      }
    }
    return Promise.reject(error);
  },
);
