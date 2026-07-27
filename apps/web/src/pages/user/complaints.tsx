import { Inbox, Clock, CheckCircle, AlertTriangle } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { ComplaintList } from "@/features/complaint-list/complaint-list";
import type { Complaint } from "@/features/complaint-list/types";

const stats = [
  {
    icon: Inbox,
    iconColor: "text-primary",
    label: "إجمالي الشكاوى",
    value: "١,٢٨٤",
    trendIcon: Inbox,
    trendText: "١٢٪ من الشهر الماضي",
    trendColor: "text-primary",
  },
  {
    icon: Clock,
    iconColor: "text-tertiary",
    label: "قيد المعالجة",
    value: "٤٢",
    trendIcon: Clock,
    trendText: "متوسط الحل: ٢٤ ساعة",
    trendColor: "text-tertiary",
  },
  {
    icon: CheckCircle,
    iconColor: "text-primary",
    label: "شكاوى محلولة",
    value: "٩٤٢",
    trendIcon: CheckCircle,
    trendText: "نسبة نجاح ٩٢٪",
    trendColor: "text-primary",
  },
  {
    icon: AlertTriangle,
    iconColor: "text-destructive",
    label: "شكاوى عاجلة",
    value: "٨",
    trendIcon: AlertTriangle,
    trendText: "تتطلب تدخل فوري",
    trendColor: "text-destructive",
  },
];

const mockComplaints: Complaint[] = [
  {
    id: "1",
    displayId: "#CMP-7241",
    subject: "عطل في البوابة الإلكترونية",
    category: "الخدمات التقنية",
    priority: "high",
    status: "in-progress",
    assignee: { name: "سارة م.", avatar: "https://github.com/shadcn.png" },
    timeAgo: "منذ ٢ ساعة",
  },
  {
    id: "2",
    displayId: "#CMP-7238",
    subject: "تأخر في استجابة الموظف",
    category: "خدمة العملاء",
    priority: "medium",
    status: "resolved",
    assignee: { name: "محمد ع.", avatar: "https://github.com/shadcn.png" },
    timeAgo: "منذ ٥ ساعات",
  },
  {
    id: "3",
    displayId: "#CMP-7235",
    subject: "خطأ في فاتورة الصيانة",
    category: "المالية",
    priority: "low",
    status: "closed",
    assignee: { name: "ليلى خ.", avatar: "https://github.com/shadcn.png" },
    timeAgo: "منذ يوم واحد",
  },
  {
    id: "4",
    displayId: "#CMP-7230",
    subject: "طلب استبدال منتج تالف",
    category: "الخدمات اللوجستية",
    priority: "high",
    status: "review",
    assignee: { name: "فريق الدعم", initials: "ف.ن" },
    timeAgo: "منذ يومين",
  },
];

export default function UserComplaints() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <ComplaintList
        complaints={mockComplaints}
        totalPages={42}
        totalCount={1284}
        pageSize={10}
      />
    </div>
  );
}
