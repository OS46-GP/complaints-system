import { Link } from "react-router";
import {
  ListChecks,
  History,
  Zap,
  FileText,
  ArrowLeft,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ReportsNav } from "@/features/reporting/components/reports-nav";
import { cn } from "@/lib/utils";

interface ReportsHubProps {
  basePath: string;
}

interface ReportCardItem {
  key: string;
  title: string;
  description: string;
  url: string;
  icon: typeof ListChecks;
}

function buildItems(basePath: string): ReportCardItem[] {
  return [
    {
      key: "custom",
      title: "تقرير مخصص",
      description:
        "حدد الفترة والجهة والقرية وحالة الفحص لعرض الشكاوى المطابقة وتصديرها بتقرير مفصّل",
      url: `${basePath}/custom`,
      icon: ListChecks,
    },
    {
      key: "scheduled",
      title: "التقارير المجدولة",
      description:
        "تصفح التقارير المنشأة تلقائيًا يوميًا وأسبوعيًا عن نسب الإنجاز والمتأخرات وصدّرها",
      url: `${basePath}/scheduled`,
      icon: History,
    },
    {
      key: "on-demand",
      title: "توليد عند الطلب",
      description:
        "أنشئ تقرير نسبة إنجاز أو متأخرات لأي فترة زمنية واحصل على نسخة PDF أو Excel، مع مسودة ذكاء اصطناعي",
      url: `${basePath}/on-demand`,
      icon: Zap,
    },
    {
      key: "memo",
      title: "الخطابات والمذكرات",
      description:
        "ابحث عن شكوى وأنشئ خطابًا رسميًا أو مذكرة للجهة المختصة بصيغة PDF",
      url: `${basePath}/memo`,
      icon: FileText,
    },
  ];
}

export function ReportsHub({ basePath }: ReportsHubProps) {
  const items = buildItems(basePath);

  return (
    <div className="flex flex-col gap-6">
      <ReportsNav basePath={basePath} />

      <PageHeader
        title="التقارير"
        description="اختر نوع التقرير الذي تريد طلبه"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.url}
            className={cn(
              "group flex flex-col gap-4 rounded-xl border border-border bg-card p-6",
              "transition-colors hover:border-primary/40 hover:bg-surface-container-lowest",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <ArrowLeft className="size-5 text-muted-foreground transition-transform group-hover:-translate-x-1" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-heading text-title-sm text-foreground">
                {item.title}
              </h3>
              <p className="text-label-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}