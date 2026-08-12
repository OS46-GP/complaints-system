import { CreditCard, MapPin, Phone, User } from "lucide-react";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";

interface ComplaintCitizenCardProps {
  complaint: ComplaintDetailsData;
}

export function ComplaintCitizenCard({ complaint }: ComplaintCitizenCardProps) {
  const location = [complaint.citizenVillage, complaint.citizenDistrict]
    .filter((part): part is string => Boolean(part))
    .join("، ");

  const rows = [
    { icon: User, label: "المواطن", value: complaint.citizenName },
    { icon: CreditCard, label: "الرقم القومي", value: complaint.citizenNationalId || "-" },
    { icon: Phone, label: "رقم الجوال", value: complaint.citizenMobile || "-" },
    { icon: MapPin, label: "العنوان", value: complaint.citizenAddress || "-" },
    { icon: MapPin, label: "القرية / المركز", value: location || "-" },
  ];

  return (
    <section className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg">
      <h3 className="font-heading text-title-sm md:text-title-md text-foreground mb-4 flex items-center gap-2">
        <User className="size-5 text-primary" />
        بيانات المواطن
      </h3>
      <dl className="space-y-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 font-heading text-label-sm text-muted-foreground shrink-0">
                <Icon className="size-4" />
                {row.label}
              </dt>
              <dd className="font-body text-body-sm text-foreground text-left break-words">
                {row.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}