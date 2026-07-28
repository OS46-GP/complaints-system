export const PATHS = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    COMPLAINTS: "/admin/complaints",
    COMPLAINT_DETAIL: (id: string) => `/admin/complaints/${id}`,
    NEW_COMPLAINT: "/admin/complaints/new",
    COMPLAINT_EDIT: (id: string) => `/admin/complaints/${id}/edit`,
    COMPLAINT_RESPONSE: (id: string) => `/admin/complaints/${id}/response`,
    USERS: "/admin/users",
    NEW_USER: "/admin/users/create",
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    SETTINGS: "/admin/settings",
  },

  USER: {
    DASHBOARD: "/user/dashboard",
    COMPLAINTS: "/user/complaints",
    COMPLAINT_DETAIL: (id: string) => `/user/complaints/${id}`,
    NEW_COMPLAINT: "/user/complaints/new",
    COMPLAINT_EDIT: (id: string) => `/user/complaints/${id}/edit`,
    COMPLAINT_RESPONSE: (id: string) => `/user/complaints/${id}/response`,
    SETTINGS: "/user/settings",
  },

  UNAUTHORIZED: "/403",
  NOT_FOUND: "/404",
} as const;
