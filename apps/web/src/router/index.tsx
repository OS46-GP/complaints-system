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
import { PageLoader } from "@/components/shared/page-loader";

const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));

const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard"));
const AdminComplaintsPage = lazy(() => import("@/pages/admin/complaints"));
const AdminOcrIntakePage = lazy(() => import("@/pages/admin/ocr-intake"));
const AdminComplaintDetailPage = lazy(
  () => import("@/pages/admin/complaint-detail"),
);
const AdminNewComplaintPage = lazy(() => import("@/pages/admin/new-complaint"));
const AdminEditComplaintPage = lazy(
  () => import("@/pages/admin/edit-complaint"),
);
const AdminComplaintResponsePage = lazy(
  () => import("@/pages/admin/complaint-response"),
);
const AdminComplaintArchivePage = lazy(
  () => import("@/pages/admin/complaint-archive"),
);
const AdminUsersPage = lazy(() => import("@/pages/admin/users"));
const AdminComplaintTypesPage = lazy(
  () => import("@/pages/admin/complaint-types"),
);
const AdminReceptionMethodsPage = lazy(
  () => import("@/pages/admin/reception-methods"),
);
const AdminDepartmentsPage = lazy(() => import("@/pages/admin/departments"));
const AdminCreateUserPage = lazy(() => import("@/pages/admin/create-user"));
const AdminUserDetailPage = lazy(() => import("@/pages/admin/user-detail"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/settings"));
const AdminSocialMonitoringPage = lazy(
  () => import("@/pages/admin/social-monitoring"),
);
const AdminReportsDashboardPage = lazy(
  () => import("@/pages/admin/reports-dashboard"),
);
const AdminCustomReportPage = lazy(() => import("@/pages/admin/custom-report"));
const AdminScheduledReportsPage = lazy(
  () => import("@/pages/admin/scheduled-reports"),
);
const AdminOnDemandReportPage = lazy(
  () => import("@/pages/admin/on-demand-report"),
);
const AdminMemoPage = lazy(() => import("@/pages/admin/memo"));

const UserDashboardPage = lazy(() => import("@/pages/user/dashboard"));
const UserComplaintsPage = lazy(() => import("@/pages/user/complaints"));
const UserOcrIntakePage = lazy(() => import("@/pages/user/ocr-intake"));
const UserNewComplaintPage = lazy(() => import("@/pages/user/new-complaint"));
const UserEditComplaintPage = lazy(
  () => import("@/pages/user/edit-complaint"),
);
const UserComplaintResponsePage = lazy(
  () => import("@/pages/user/complaint-response"),
);
const UserComplaintArchivePage = lazy(
  () => import("@/pages/user/complaint-archive"),
);
const UserComplaintDetailPage = lazy(
  () => import("@/pages/user/complaint-detail"),
);
const UserSocialMonitoringPage = lazy(
  () => import("@/pages/user/social-monitoring"),
);
const UserSettingsPage = lazy(() => import("@/pages/user/settings"));
const UserReportsDashboardPage = lazy(
  () => import("@/pages/user/reports-dashboard"),
);
const UserCustomReportPage = lazy(() => import("@/pages/user/custom-report"));
const UserScheduledReportsPage = lazy(
  () => import("@/pages/user/scheduled-reports"),
);
const UserOnDemandReportPage = lazy(
  () => import("@/pages/user/on-demand-report"),
);
const UserMemoPage = lazy(() => import("@/pages/user/memo"));

const NotFoundPage = lazy(() => import("@/pages/not-found"));
const ForbiddenPage = lazy(() => import("@/pages/forbidden"));

function SuspenseBoundary({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={PATHS.LOGIN} replace />} />

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
              path={PATHS.ADMIN.COMPLAINT_OCR}
              element={
                <SuspenseBoundary>
                  <AdminOcrIntakePage />
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
              path={PATHS.ADMIN.COMPLAINT_EDIT(":id")}
              element={
                <SuspenseBoundary>
                  <AdminEditComplaintPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.COMPLAINT_RESPONSE(":id")}
              element={
                <SuspenseBoundary>
                  <AdminComplaintResponsePage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.COMPLAINT_ARCHIVE(":id")}
              element={
                <SuspenseBoundary>
                  <AdminComplaintArchivePage />
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
              path={PATHS.ADMIN.COMPLAINT_TYPES}
              element={
                <SuspenseBoundary>
                  <AdminComplaintTypesPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.RECEPTION_METHODS}
              element={
                <SuspenseBoundary>
                  <AdminReceptionMethodsPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.DEPARTMENTS}
              element={
                <SuspenseBoundary>
                  <AdminDepartmentsPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.NEW_USER}
              element={
                <SuspenseBoundary>
                  <AdminCreateUserPage />
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
              path={PATHS.ADMIN.SOCIAL_MONITORING}
              element={
                <SuspenseBoundary>
                  <AdminSocialMonitoringPage />
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
            <Route
              path={PATHS.ADMIN.REPORTS.DASHBOARD}
              element={
                <SuspenseBoundary>
                  <AdminReportsDashboardPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.REPORTS.CUSTOM}
              element={
                <SuspenseBoundary>
                  <AdminCustomReportPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.REPORTS.SCHEDULED}
              element={
                <SuspenseBoundary>
                  <AdminScheduledReportsPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.REPORTS.ON_DEMAND}
              element={
                <SuspenseBoundary>
                  <AdminOnDemandReportPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.REPORTS.MEMO}
              element={
                <SuspenseBoundary>
                  <AdminMemoPage />
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
              path={PATHS.USER.COMPLAINT_OCR}
              element={
                <SuspenseBoundary>
                  <UserOcrIntakePage />
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
              path={PATHS.USER.NEW_COMPLAINT}
              element={
                <SuspenseBoundary>
                  <UserNewComplaintPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.COMPLAINT_EDIT(":id")}
              element={
                <SuspenseBoundary>
                  <UserEditComplaintPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.COMPLAINT_RESPONSE(":id")}
              element={
                <SuspenseBoundary>
                  <UserComplaintResponsePage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.COMPLAINT_ARCHIVE(":id")}
              element={
                <SuspenseBoundary>
                  <UserComplaintArchivePage />
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
              path={PATHS.USER.SOCIAL_MONITORING}
              element={
                <SuspenseBoundary>
                  <UserSocialMonitoringPage />
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
            <Route
              path={PATHS.USER.REPORTS.DASHBOARD}
              element={
                <SuspenseBoundary>
                  <UserReportsDashboardPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.REPORTS.CUSTOM}
              element={
                <SuspenseBoundary>
                  <UserCustomReportPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.REPORTS.SCHEDULED}
              element={
                <SuspenseBoundary>
                  <UserScheduledReportsPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.REPORTS.ON_DEMAND}
              element={
                <SuspenseBoundary>
                  <UserOnDemandReportPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.REPORTS.MEMO}
              element={
                <SuspenseBoundary>
                  <UserMemoPage />
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
