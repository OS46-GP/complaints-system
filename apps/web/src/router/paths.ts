export const PATHS = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    COMPLAINTS: "/admin/complaints",
    COMPLAINT_DETAIL: (id: string) => `/admin/complaints/${id}`,
    NEW_COMPLAINT: "/admin/complaints/new",
    USERS: "/admin/users",
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    SETTINGS: "/admin/settings",
  },

  USER: {
    DASHBOARD: "/user/dashboard",
    COMPLAINTS: "/user/complaints",
    COMPLAINT_DETAIL: (id: string) => `/user/complaints/${id}`,
    NEW_COMPLAINT: "/user/complaints/new",
    SETTINGS: "/user/settings",
  },

  UNAUTHORIZED: "/403",
  NOT_FOUND: "/404",
} as const;
