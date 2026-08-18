import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { PATHS } from "./paths";

import GuestGuard from "./guards/guest-guard";
import AdminGuard from "./guards/admin-guard";
import UserGuard from "./guards/user-guard";
import SuperAdminGuard from "./guards/super-admin-guard";

import AuthLayout from "@/layouts/auth-layout";
import AdminLayout from "@/layouts/admin-layout";
import UserLayout from "@/layouts/user-layout";
import SuperAdminLayout from "@/layouts/super-admin-layout";
import DefaultLayout from "@/layouts/default-layout";
import { PageLoader } from "@/components/shared/page-loader";
import { PageTransition } from "@/components/shared/page-transition";

const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));

const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard"));
const AdminComplaintsPage = lazy(() => import("@/pages/admin/complaints"));
const AdminDueAssignmentsPage = lazy(
  () => import("@/pages/admin/assignments-due"),
);
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
const AdminComplaintReassignPage = lazy(
  () => import("@/pages/admin/complaint-reassign"),
);
const AdminComplaintUrgencyPage = lazy(
  () => import("@/pages/admin/complaint-urgency"),
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
const AdminLetterTemplatesPage = lazy(
  () => import("@/pages/admin/letter-templates"),
);
const AdminLetterTemplateNewPage = lazy(
  () => import("@/pages/admin/letter-template-new"),
);
const AdminLetterTemplateEditPage = lazy(
  () => import("@/pages/admin/letter-template-edit"),
);
const AdminLetterSettingsPage = lazy(
  () => import("@/pages/admin/letter-settings"),
);
const AdminLetterVariablesPage = lazy(
  () => import("@/pages/admin/letter-variables"),
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
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/analytics"));
const AdminCustomReportPage = lazy(() => import("@/pages/admin/custom-report"));
const AdminScheduledReportsPage = lazy(
  () => import("@/pages/admin/scheduled-reports"),
);
const AdminOnDemandReportPage = lazy(
  () => import("@/pages/admin/on-demand-report"),
);
const AdminMemoPage = lazy(() => import("@/pages/admin/memo"));
const AdminProfilePage = lazy(() => import("@/pages/admin/profile"));
const AdminNotificationsPage = lazy(
  () => import("@/pages/admin/notifications"),
);

const SuperAdminDashboardPage = lazy(
  () => import("@/pages/super-admin/dashboard"),
);
const SuperAdminUsersPage = lazy(() => import("@/pages/super-admin/users"));
const SuperAdminCreateUserPage = lazy(
  () => import("@/pages/super-admin/create-user"),
);
const SuperAdminUserDetailPage = lazy(
  () => import("@/pages/super-admin/user-detail"),
);
const SuperAdminSettingsPage = lazy(
  () => import("@/pages/super-admin/settings"),
);
const SuperAdminProfilePage = lazy(
  () => import("@/pages/super-admin/profile"),
);
const SuperAdminNotificationsPage = lazy(
  () => import("@/pages/super-admin/notifications"),
);

const UserDashboardPage = lazy(() => import("@/pages/user/dashboard"));
const UserComplaintsPage = lazy(() => import("@/pages/user/complaints"));
const UserDueAssignmentsPage = lazy(
  () => import("@/pages/user/assignments-due"),
);
const UserOcrIntakePage = lazy(() => import("@/pages/user/ocr-intake"));
const UserNewComplaintPage = lazy(() => import("@/pages/user/new-complaint"));
const UserEditComplaintPage = lazy(
  () => import("@/pages/user/edit-complaint"),
);
const UserComplaintResponsePage = lazy(
  () => import("@/pages/user/complaint-response"),
);
const UserComplaintReassignPage = lazy(
  () => import("@/pages/user/complaint-reassign"),
);
const UserComplaintUrgencyPage = lazy(
  () => import("@/pages/user/complaint-urgency"),
);
const UserComplaintArchivePage = lazy(
  () => import("@/pages/user/complaint-archive"),
);
const UserComplaintDetailPage = lazy(
  () => import("@/pages/user/complaint-detail"),
);
const UserNotificationsPage = lazy(() => import("@/pages/user/notifications"));
const UserSocialMonitoringPage = lazy(
  () => import("@/pages/user/social-monitoring"),
);
const UserSettingsPage = lazy(() => import("@/pages/user/settings"));
const UserReportsDashboardPage = lazy(
  () => import("@/pages/user/reports-dashboard"),
);
const UserAnalyticsPage = lazy(() => import("@/pages/user/analytics"));
const UserCustomReportPage = lazy(() => import("@/pages/user/custom-report"));
const UserScheduledReportsPage = lazy(
  () => import("@/pages/user/scheduled-reports"),
);
const UserOnDemandReportPage = lazy(
  () => import("@/pages/user/on-demand-report"),
);
const UserMemoPage = lazy(() => import("@/pages/user/memo"));
const UserProfilePage = lazy(() => import("@/pages/user/profile"));

const NotFoundPage = lazy(() => import("@/pages/not-found"));
const ForbiddenPage = lazy(() => import("@/pages/forbidden"));

const PresentationPage = lazy(() => import("@/pages/presentation"));

function SuspenseBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
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
              path={PATHS.ADMIN.PROFILE}
              element={
                <SuspenseBoundary>
                  <AdminProfilePage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.NOTIFICATIONS.ADMIN}
              element={
                <SuspenseBoundary>
                  <AdminNotificationsPage />
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
              path={PATHS.ADMIN.DUE_ASSIGNMENTS}
              element={
                <SuspenseBoundary>
                  <AdminDueAssignmentsPage />
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
              path={PATHS.ADMIN.COMPLAINT_REASSIGN(":id")}
              element={
                <SuspenseBoundary>
                  <AdminComplaintReassignPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.COMPLAINT_URGENCY(":id")}
              element={
                <SuspenseBoundary>
                  <AdminComplaintUrgencyPage />
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
              path={PATHS.ADMIN.LETTER_TEMPLATES}
              element={
                <SuspenseBoundary>
                  <AdminLetterTemplatesPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.LETTER_TEMPLATE_NEW}
              element={
                <SuspenseBoundary>
                  <AdminLetterTemplateNewPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.LETTER_TEMPLATE_EDIT(":id")}
              element={
                <SuspenseBoundary>
                  <AdminLetterTemplateEditPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.LETTER_SETTINGS}
              element={
                <SuspenseBoundary>
                  <AdminLetterSettingsPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.LETTER_VARIABLES}
              element={
                <SuspenseBoundary>
                  <AdminLetterVariablesPage />
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
              path={PATHS.ADMIN.ANALYTICS}
              element={
                <SuspenseBoundary>
                  <AdminAnalyticsPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.ADMIN.REPORTS.DELAYS}
              element={<Navigate to={PATHS.ADMIN.ANALYTICS} replace />}
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

        <Route element={<SuperAdminGuard />}>
          <Route element={<SuperAdminLayout />}>
            <Route
              path={PATHS.SUPER_ADMIN.DASHBOARD}
              element={
                <SuspenseBoundary>
                  <SuperAdminDashboardPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.SUPER_ADMIN.PROFILE}
              element={
                <SuspenseBoundary>
                  <SuperAdminProfilePage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.SUPER_ADMIN.USERS}
              element={
                <SuspenseBoundary>
                  <SuperAdminUsersPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.SUPER_ADMIN.NEW_USER}
              element={
                <SuspenseBoundary>
                  <SuperAdminCreateUserPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.SUPER_ADMIN.USER_DETAIL(":id")}
              element={
                <SuspenseBoundary>
                  <SuperAdminUserDetailPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.NOTIFICATIONS.SUPER_ADMIN}
              element={
                <SuspenseBoundary>
                  <SuperAdminNotificationsPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.SUPER_ADMIN.SETTINGS}
              element={
                <SuspenseBoundary>
                  <SuperAdminSettingsPage />
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
              path={PATHS.USER.PROFILE}
              element={
                <SuspenseBoundary>
                  <UserProfilePage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.NOTIFICATIONS.USER}
              element={
                <SuspenseBoundary>
                  <UserNotificationsPage />
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
              path={PATHS.USER.COMPLAINT_REASSIGN(":id")}
              element={
                <SuspenseBoundary>
                  <UserComplaintReassignPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.COMPLAINT_URGENCY(":id")}
              element={
                <SuspenseBoundary>
                  <UserComplaintUrgencyPage />
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
              path={PATHS.USER.DUE_ASSIGNMENTS}
              element={
                <SuspenseBoundary>
                  <UserDueAssignmentsPage />
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
              path={PATHS.USER.ANALYTICS}
              element={
                <SuspenseBoundary>
                  <UserAnalyticsPage />
                </SuspenseBoundary>
              }
            />
            <Route
              path={PATHS.USER.REPORTS.DELAYS}
              element={<Navigate to={PATHS.USER.ANALYTICS} replace />}
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

        <Route
          path={PATHS.PRESENT}
          element={
            <Suspense fallback={<PageLoader />}>
              <PresentationPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to={PATHS.NOT_FOUND} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
