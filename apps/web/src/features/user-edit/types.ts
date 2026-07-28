export interface UserEditFormData {
  username: string;
  password: string;
  email: string;
  role: "Official" | "Admin";
}
