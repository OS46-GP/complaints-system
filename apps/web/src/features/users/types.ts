export type UserStatus = "online" | "offline";

export interface User {
  id: string;
  username: string;
  role: string;
  roleLabel: string;
  email: string;
  department: string;
  status: UserStatus;
  lastSeen: string;
  avatar: string;
}

export interface ApiUser {
  id: string;
  username: string;
  role: "Official" | "Admin";
  createdAt: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  role: "Official" | "Admin";
}

export interface UpdateUserPayload {
  password?: string;
  role?: "Official" | "Admin";
}

export interface UserFormData {
  username: string;
  password: string;
  email: string;
  role: "Official" | "Admin";
  department?: string;
  jobTitle?: string;
}

export interface UserEditFormData {
  username: string;
  password: string;
  email: string;
  role: "Official" | "Admin";
}

const ROLE_LABELS: Record<string, string> = {
  Official: "موظف",
  Admin: "مدير نظام",
};

export function mapApiUser(api: ApiUser): User {
  return {
    id: api.id,
    username: api.username,
    role: api.role,
    roleLabel: ROLE_LABELS[api.role] ?? api.role,
    email: "",
    department: "",
    status: "offline",
    lastSeen: api.createdAt
      ? new Date(api.createdAt).toLocaleDateString("ar-SA")
      : "-",
    avatar: "",
  };
}
