import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
