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
