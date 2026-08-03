import { create } from "zustand";
import type { User } from "./types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User, remember: boolean) => void;
  logout: () => void;
}

function decodeToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : "",
    };
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (typeof payload.exp !== "number") {
      return false;
    }
    return payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function loadPersistedAuth(): { token: string | null; user: User | null } {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (isTokenExpired(token)) {
      clearStoredAuth();
      return { token: null, user: null };
    }
    const stored = token
      ? sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
      : null;
    return { token, user: stored ? JSON.parse(stored) : null };
  } catch {
    return { token: null, user: null };
  }
}

const persisted = loadPersistedAuth();

export const useAuthStore = create<AuthState>((set) => ({
  token: persisted.token,
  user: persisted.user,
  isAuthenticated: !!persisted.token,
  setAuth: (token, user, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    clearStoredAuth();
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export function persistAuthFromToken(token: string, remember = true) {
  const user = decodeToken(token);
  if (user) {
    useAuthStore.getState().setAuth(token, user, remember);
  }
  return user;
}
