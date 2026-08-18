export type UserStatus = "online" | "offline";

export type RowRole = "Official" | "Admin" | "SuperAdmin";

export interface User {
  id: string;
  username: string;
  role: string;
  roleLabel: string;
  email: string;
  nationalId: string;
  department: string;
  status: UserStatus;
  lastSeen: string;
  avatar: string;
  isBlocked: boolean;
}

export interface ApiUser {
  id: string;
  username: string;
  fullName?: string | null;
  email?: string | null;
  nationalId?: string | null;
  role: RowRole;
  isBlocked?: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  role: RowRole;
  fullName?: string;
  email?: string;
  nationalId?: string;
}

export interface UpdateUserPayload {
  password?: string;
  role?: RowRole;
  fullName?: string;
  email?: string;
  nationalId?: string;
}

export interface UserFormData {
  username: string;
  password: string;
  email: string;
  nationalId: string;
  role: RowRole;
  department?: string;
  jobTitle?: string;
}

export interface UserEditFormData {
  username: string;
  password: string;
  email: string;
  nationalId: string;
  role: RowRole;
}

const ROLE_LABELS: Record<string, string> = {
  Official: "موظف",
  Admin: "مدير نظام",
  SuperAdmin: "مدير النظام الأعلى",
};

export function mapApiUser(api: ApiUser): User {
  return {
    id: api.id,
    username: api.username,
    role: api.role,
    roleLabel: ROLE_LABELS[api.role] ?? api.role,
    email: api.email ?? "",
    nationalId: api.nationalId ?? "",
    department: "",
    status: "offline",
    lastSeen: api.createdAt
      ? new Date(api.createdAt).toLocaleDateString("ar-SA")
      : "-",
    avatar: "",
    isBlocked: api.isBlocked ?? false,
  };
}
