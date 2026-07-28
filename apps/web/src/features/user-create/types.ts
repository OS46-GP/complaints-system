export interface CreateUserPayload {
  username: string;
  password: string;
  role: "Official" | "Admin";
}

export interface CreateUserFormData {
  username: string;
  password: string;
  email: string;
  role: "Official" | "Admin";
}
