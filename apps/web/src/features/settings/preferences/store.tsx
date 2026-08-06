/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  type UserPreferences,
} from "./types";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type PreferencesProviderState = {
  preferences: UserPreferences;
  updatePreferences: (update: DeepPartial<UserPreferences>) => void;
  resetPreferences: () => void;
};

const initialState: PreferencesProviderState = {
  preferences: DEFAULT_PREFERENCES,
  updatePreferences: () => null,
  resetPreferences: () => null,
};

const PreferencesContext = createContext<PreferencesProviderState>(initialState);

function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      complaints: {
        ...DEFAULT_PREFERENCES.complaints,
        ...parsed.complaints,
      },
      dashboard: {
        ...DEFAULT_PREFERENCES.dashboard,
        ...parsed.dashboard,
      },
      notifications: {
        ...DEFAULT_PREFERENCES.notifications,
        ...parsed.notifications,
      },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function mergeDeep<T extends object>(base: T, patch: DeepPartial<T>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    const current = (base as Record<string, unknown>)[key];
    result[key] =
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      current &&
      typeof current === "object"
        ? mergeDeep(current, value)
        : value;
  }
  return result as T;
}

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] =
    useState<UserPreferences>(loadPreferences);

  useEffect(() => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  }, [preferences]);

  const value = {
    preferences,
    updatePreferences: (update: DeepPartial<UserPreferences>) => {
      setPreferences((prev) => mergeDeep(prev, update));
    },
    resetPreferences: () => setPreferences({ ...DEFAULT_PREFERENCES }),
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext);

  if (context === undefined)
    throw new Error(
      "usePreferences must be used within a PreferencesProvider",
    );

  return context;
};
