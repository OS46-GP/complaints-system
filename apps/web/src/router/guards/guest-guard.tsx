import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/features/auth/store";
import { PATHS } from "../paths";

export default function GuestGuard() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (token && user) {
    const dashboard =
      user.role === "Admin" ? PATHS.ADMIN.DASHBOARD : PATHS.USER.DASHBOARD;
    return <Navigate to={dashboard} replace />;
  }

  return <Outlet />;
}
