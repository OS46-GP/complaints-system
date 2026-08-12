import { useNavigate, useLocation } from "react-router";
import { FileText, Unlink } from "lucide-react";
import type { RecurrenceMatch } from "@/features/complaint-list/types";

function formatArrivalDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("ar-SA");
  } catch {
    return value;
  }
}

interface RecurrenceMatchListProps {
  matches: RecurrenceMatch[];
  emptyText?: string;
  onUnlink?: (id: string) => void;
  onSelect?: (match: RecurrenceMatch) => void;
  isLoading?: boolean;
}

export function RecurrenceMatchList({
  matches,
  emptyText = "لا توجد شكاوى مشابهة.",
  onUnlink,
  onSelect,
  isLoading = false,
}: RecurrenceMatchListProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const basePath = isAdmin ? "/admin/complaints" : "/user/complaints";

  if (matches.length === 0) {
    return (
      <p className="font-body text-body-md text-muted-foreground">{emptyText}</p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
      {matches.map((match) => (
        <li key={match.id}>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => (onSelect ? onSelect(match) : navigate(`${basePath}/${match.id}`))}
            className="w-full text-right px-4 py-3 hover:bg-surface-container-high transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-heading text-label-sm text-foreground">
                <FileText className="size-4 text-muted-foreground" />
                #{match.complaintNumber}-{match.statementYear}
              </span>
              <span className="flex items-center gap-2">
                {match.examinationStatus && (
                  <span className="font-body text-label-xs text-muted-foreground">
                    {match.examinationStatus}
                  </span>
                )}
                {onUnlink && (
                  <button
                    type="button"
                    aria-label="إلغاء الربط"
                    title="إلغاء الربط"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnlink(match.id);
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Unlink className="size-4" />
                  </button>
                )}
              </span>
            </span>
            <span className="block mt-1 font-body text-body-md text-muted-foreground truncate">
              {match.subject}
            </span>
            <span className="block mt-1 font-body text-label-xs text-muted-foreground">
              تاريخ الوصول: {formatArrivalDate(match.arrivalDate)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
