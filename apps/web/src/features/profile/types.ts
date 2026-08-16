export interface ProfileUser {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  nationalId: string | null;
  role: "Official" | "Admin" | "SuperAdmin";
  createdAt: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
