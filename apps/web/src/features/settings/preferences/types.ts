export type Language = "ar" | "en";

export interface ComplaintsListPreferences {
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface DashboardPreferences {
  dateRange: "lastYear" | "currentMonth";
}

export interface NotificationPreferences {
  emailOnUpdate: boolean;
}

export interface UserPreferences {
  language: Language;
  complaints: ComplaintsListPreferences;
  dashboard: DashboardPreferences;
  notifications: NotificationPreferences;
}

export const PREFERENCES_STORAGE_KEY = "complaints-system-preferences";

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: "ar",
  complaints: {
    pageSize: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  dashboard: {
    dateRange: "lastYear",
  },
  notifications: {
    emailOnUpdate: true,
  },
};
