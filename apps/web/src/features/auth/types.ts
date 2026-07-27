export interface User {
  id: string;
  username: string;
  role: "Official" | "Admin";
  createdAt: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}
