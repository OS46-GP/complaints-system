import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/features/auth/store";
import { PATHS } from "../paths";

export default function SuperAdminGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  if (user?.role !== "SuperAdmin") {
    return <Navigate to={PATHS.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}
