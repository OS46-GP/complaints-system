export interface User {
  id: string;
  username: string;
  fullName?: string | null;
  email?: string | null;
  nationalId?: string | null;
  role: "Official" | "Admin" | "SuperAdmin";
  createdAt: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}
