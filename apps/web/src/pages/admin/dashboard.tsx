import { BarChart3, FilePlus2, MessagesSquare, ScanLine } from "lucide-react";

import { DashboardPage } from "@/features/dashboard/dashboard";
import { PATHS } from "@/router/paths";

const quickActions = [
  {
    key: "new",
    title: "تسجيل شكوى جديدة",
    description: "إضافة شكوى جديدة للنظام",
    url: PATHS.ADMIN.NEW_COMPLAINT,
    icon: FilePlus2,
  },
  {
    key: "ocr",
    title: "الإدخال بالقراءة الضوئية",
    description: "استخراج الشكاوى من الصور والمستندات",
    url: PATHS.ADMIN.COMPLAINT_OCR,
    icon: ScanLine,
  },
  {
    key: "reports",
    title: "التقارير واللوحات",
    description: "نسب الإنجاز وتقارير المتأخرات",
    url: PATHS.ADMIN.REPORTS.DASHBOARD,
    icon: BarChart3,
  },
  {
    key: "social",
    title: "الرصد الاجتماعي",
    description: "متابعة الشكاوى من وسائل التواصل",
    url: PATHS.ADMIN.SOCIAL_MONITORING,
    icon: MessagesSquare,
  },
];

export default function AdminDashboard() {
  return <DashboardPage quickActions={quickActions} />;
}