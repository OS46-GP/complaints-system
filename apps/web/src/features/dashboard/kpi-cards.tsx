import {
  AlarmClock,
  AlertTriangle,
  CalendarRange,
  ClipboardList,
  FolderOpen,
  Target,
  TrendingUp,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { Reveal } from "@/components/shared/reveal";

interface DashboardKpiCardsProps {
  total: number;
  open: number;
  achievement: number;
  totalOverdue: number;
}

function num(value: number): string {
  return value.toLocaleString("ar-SA");
}

export function DashboardKpiCards({
  total,
  open,
  achievement,
  totalOverdue,
}: Readonly<DashboardKpiCardsProps>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Reveal delay={0}>
        <StatCard
          icon={ClipboardList}
          iconColor="text-primary"
          label="إجمالي الشكاوى"
          value={num(total)}
          trendIcon={CalendarRange}
          trendText="خلال الفترة المحددة"
        />
      </Reveal>
      <Reveal delay={80}>
        <StatCard
          icon={FolderOpen}
          iconColor="text-amber-500"
          label="الشكاوى قيد الفحص"
          value={num(open)}
          trendIcon={TrendingUp}
          trendText="غير منتهية بعد"
        />
      </Reveal>
      <Reveal delay={160}>
        <StatCard
          icon={Target}
          iconColor="text-primary"
          label="نسبة الإنجاز"
          value={`${num(achievement)}٪`}
          trendIcon={TrendingUp}
          trendText="الإنجاز الكلي"
        />
      </Reveal>
      <Reveal delay={240}>
        <StatCard
          icon={AlarmClock}
          iconColor="text-destructive"
          label="الشكاوى المتأخرة"
          value={num(totalOverdue)}
          trendIcon={AlertTriangle}
          trendColor="text-destructive"
          trendText="أكثر من 30 يوم"
        />
      </Reveal>
    </div>
  );
}