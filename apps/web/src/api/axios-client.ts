import axios from "axios";
import { getAuthToken, useAuthStore } from "@/features/auth/store";
import { PATHS } from "@/router/paths";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

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
