export const PATHS = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    COMPLAINTS: "/admin/complaints",
    COMPLAINT_OCR: "/admin/complaints/ocr",
    COMPLAINT_DETAIL: (id: string) => `/admin/complaints/${id}`,
    NEW_COMPLAINT: "/admin/complaints/new",
    COMPLAINT_EDIT: (id: string) => `/admin/complaints/${id}/edit`,
    COMPLAINT_RESPONSE: (id: string) => `/admin/complaints/${id}/response`,
    COMPLAINT_ARCHIVE: (id: string) => `/admin/complaints/${id}/archive`,
    USERS: "/admin/users",
    NEW_USER: "/admin/users/create",
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    SOCIAL_MONITORING: "/admin/social-monitoring",
    SETTINGS: "/admin/settings",
  },

  USER: {
    DASHBOARD: "/user/dashboard",
    COMPLAINTS: "/user/complaints",
    COMPLAINT_OCR: "/user/complaints/ocr",
    COMPLAINT_DETAIL: (id: string) => `/user/complaints/${id}`,
    NEW_COMPLAINT: "/user/complaints/new",
    COMPLAINT_EDIT: (id: string) => `/user/complaints/${id}/edit`,
    COMPLAINT_RESPONSE: (id: string) => `/user/complaints/${id}/response`,
    COMPLAINT_ARCHIVE: (id: string) => `/user/complaints/${id}/archive`,
    SOCIAL_MONITORING: "/user/social-monitoring",
    SETTINGS: "/user/settings",
  },

  UNAUTHORIZED: "/403",
  NOT_FOUND: "/404",
} as const;
