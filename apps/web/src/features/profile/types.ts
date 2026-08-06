export interface ProfileUser {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  role: "Official" | "Admin";
  createdAt: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
