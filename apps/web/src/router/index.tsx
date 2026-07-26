import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { PATHS } from "./paths";

import GuestGuard from "./guards/guest-guard";
import AdminGuard from "./guards/admin-guard";
import UserGuard from "./guards/user-guard";

import AuthLayout from "@/layouts/auth-layout";
import AdminLayout from "@/layouts/admin-layout";
import UserLayout from "@/layouts/user-layout";
import DefaultLayout from "@/layouts/default-layout";

const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/forgot-password"),
);

const AdminDashboardPage = lazy(
  () => import("@/pages/admin/dashboard"),
);
const AdminComplaintsPage = lazy(
  () => import("@/pages/admin/complaints"),
);
const AdminComplaintDetailPage = lazy(
  () => import("@/pages/admin/complaint-detail"),
);
const AdminNewComplaintPage = lazy(
  () => import("@/pages/admin/new-complaint"),
);
const AdminUsersPage = lazy(
  () => import("@/pages/admin/users"),
);
const AdminUserDetailPage = lazy(
  () => import("@/pages/admin/user-detail"),
);
const AdminSettingsPage = lazy(
  () => import("@/pages/admin/settings"),
);

const UserDashboardPage = lazy(
  () => import("@/pages/user/dashboard"),
);
const UserComplaintsPage = lazy(
  () => import("@/pages/user/complaints"),
);
const UserNewComplaintPage = lazy(
  () => import("@/pages/user/new-complaint"),
);
const UserComplaintDetailPage = lazy(
  () => import("@/pages/user/complaint-detail"),
);
const UserSettingsPage = lazy(
  () => import("@/pages/user/settings"),
);

const NotFoundPage = lazy(() => import("@/pages/not-found"));
const ForbiddenPage = lazy(() => import("@/pages/forbidden"));

function Loading() {
  return <div>Loading...</div>;
}

function SuspenseBoundary({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={PATHS.LOGIN} replace />}
        />

        <Route element={<GuestGuard />}>
          <Route element={<AuthLayout />}>
            <Route
              path={PATHS.LOGIN}
              element={
                <SuspenseBoundary>
                  <LoginPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.REGISTER}
              element={
                <SuspenseBoundary>
                  <RegisterPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.FORGOT_PASSWORD}
              element={
                <SuspenseBoundary>
                  <ForgotPasswordPage />
                </SuspenseBoundary>
              }
            />
          </Route>
        </Route>

        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route
              path={PATHS.ADMIN.DASHBOARD}
              element={
                <SuspenseBoundary>
                  <AdminDashboardPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.COMPLAINTS}
              element={
                <SuspenseBoundary>
                  <AdminComplaintsPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.COMPLAINT_DETAIL(":id")}
              element={
                <SuspenseBoundary>
                  <AdminComplaintDetailPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.NEW_COMPLAINT}
              element={
                <SuspenseBoundary>
                  <AdminNewComplaintPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.USERS}
              element={
                <SuspenseBoundary>
                  <AdminUsersPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.USER_DETAIL(":id")}
              element={
                <SuspenseBoundary>
                  <AdminUserDetailPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.SETTINGS}
              element={
                <SuspenseBoundary>
                  <AdminSettingsPage />
                </SuspenseBoundary>
              }
            />
          </Route>
        </Route>

        <Route element={<UserGuard />}>
          <Route element={<UserLayout />}>
            <Route
              path={PATHS.USER.DASHBOARD}
              element={
                <SuspenseBoundary>
                  <UserDashboardPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.COMPLAINTS}
              element={
                <SuspenseBoundary>
                  <UserComplaintsPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.NEW_COMPLAINT}
              element={
                <SuspenseBoundary>
                  <UserNewComplaintPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.COMPLAINT_DETAIL(":id")}
              element={
                <SuspenseBoundary>
                  <UserComplaintDetailPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.SETTINGS}
              element={
                <SuspenseBoundary>
                  <UserSettingsPage />
                </SuspenseBoundary>
              }
            />
          </Route>
        </Route>

        <Route element={<DefaultLayout />}>
          <Route
            path={PATHS.UNAUTHORIZED}
            element={
              <SuspenseBoundary>
                <ForbiddenPage />
              </SuspenseBoundary>
            }
          />
          <Route
            path={PATHS.NOT_FOUND}
            element={
              <SuspenseBoundary>
                <NotFoundPage />
              </SuspenseBoundary>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to={PATHS.NOT_FOUND} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
