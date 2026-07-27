export type UserStatus = "online" | "offline";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleTitle: string;
  department: string;
  activeCases: number;
  activeCasesMax: number;
  status: UserStatus;
  lastSeen: string;
  avatar: string;
}
