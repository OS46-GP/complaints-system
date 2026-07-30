import axios from "axios";
import { getAuthToken } from "@/features/auth/store";

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
