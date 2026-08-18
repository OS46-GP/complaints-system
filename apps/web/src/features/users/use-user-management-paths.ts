import { useAuthStore } from "@/features/auth/store";
import { PATHS } from "@/router/paths";

export function useUserManagementPaths() {
  const role = useAuthStore((s) => s.user?.role);
  const isSuperAdmin = role === "SuperAdmin";
  return {
    isSuperAdmin,
    usersList: isSuperAdmin ? PATHS.SUPER_ADMIN.USERS : PATHS.ADMIN.USERS,
    newUser: isSuperAdmin ? PATHS.SUPER_ADMIN.NEW_USER : PATHS.ADMIN.NEW_USER,
    userDetail: (id: string) =>
      isSuperAdmin ? PATHS.SUPER_ADMIN.USER_DETAIL(id) : PATHS.ADMIN.USER_DETAIL(id),
  };
}
