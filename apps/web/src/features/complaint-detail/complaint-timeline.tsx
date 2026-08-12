import { useMemo, useState } from "react";
import {
  Check,
  Clock,
  FileUp,
  MessageSquareReply,
  User,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AssignmentStatusBadge } from "@/features/complaint-detail/assignment-status-badge";
import { ComplaintAssignmentDetailsDialog } from "@/features/complaint-detail/complaint-assignment-details-dialog";
import {
  computeDueDate,
  formatDate,
} from "@/features/complaint-detail/assignment-status";
import type { AssignmentStatus, ComplaintDetailsData } from "@/features/complaint-detail/types";

interface ComplaintTimelineProps {
  complaint: ComplaintDetailsData;
}

interface TimelineEvent {
  id: string;
  atTime: number;
  order: number;
  assignmentId: string | null;
  title: string;
  description: string | null;
  meta: string[];
  badge: AssignmentStatus | null;
  warning: boolean;
  icon: "registered" | "assignment" | "response" | "urgency" | "warning";
}

function buildEvents(complaint: ComplaintDetailsData): TimelineEvent[] {
  const registeredAt = new Date(complaint.createdAt).getTime();
  const events: TimelineEvent[] = [
    {
      id: "registered",
      atTime: registeredAt,
      order: 0,
      assignmentId: null,
      title: "تم تسجيل الشكوى",
      description: complaint.subject,
      meta: [complaint.createdBy || "النظام", formatDate(complaint.createdAt)],
      badge: null,
      warning: false,
      icon: "registered",
    },
  ];

  for (const assignment of complaint.assignmentHistory) {
    const startedAt = assignment.createdAt
      ? new Date(assignment.createdAt).getTime()
      : registeredAt;

    events.push({
      id: `assignment-${assignment.id}`,
      atTime: startedAt,
      order: 1,
      assignmentId: assignment.id,
      title: `إحالة إلى ${assignment.departmentName} — الإحالة رقم ${assignment.assignmentIndex}`,
      description: null,
      meta: [
        assignment.outgoingLetterNumber
          ? `رقم الصادر: ${assignment.outgoingLetterNumber}`
          : "",
        assignment.outgoingLetterDate
          ? `تاريخ الصادر: ${formatDate(assignment.outgoingLetterDate)}`
          : "",
        assignment.responseDeadlineDays
          ? `المهلة: ${assignment.responseDeadlineDays} يوم`
          : "",
        formatDate(assignment.createdAt),
      ].filter(Boolean),
      badge: assignment.status,
      warning: false,
      icon: "assignment",
    });

    const hasResponse = !!assignment.responseText || !!assignment.respondedAt;
    if (hasResponse) {
      const respondedAt = assignment.respondedAt ?? assignment.responseDate ?? assignment.createdAt;
      events.push({
        id: `response-${assignment.id}`,
        atTime: new Date(respondedAt).getTime(),
        order: 2,
        assignmentId: assignment.id,
        title: `رد ${assignment.departmentName}`,
        description: assignment.responseText,
        meta: [
          assignment.responseNumber ? `رقم الرد: ${assignment.responseNumber}` : "",
          assignment.responseDate ? formatDate(assignment.responseDate) : "",
          assignment.examinationStatusName ?? "",
          assignment.examinationResult ?? "",
        ].filter(Boolean),
        badge: "RESPONDED",
        warning: false,
        icon: "response",
      });
    } else if (assignment.status === "OVERDUE") {
      const due = computeDueDate(assignment);
      events.push({
        id: `overdue-${assignment.id}`,
        atTime: due ? due.getTime() : startedAt,
        order: 3,
        assignmentId: assignment.id,
        title: `${assignment.departmentName} — انتهت المهلة دون رد`,
        description: null,
        meta: [
          due ? `تاريخ الاستحقاق: ${formatDate(due.toISOString())}` : "",
          assignment.outgoingLetterDate
            ? `تاريخ الصادر: ${formatDate(assignment.outgoingLetterDate)}`
            : "",
        ].filter(Boolean),
        badge: "OVERDUE",
        warning: true,
        icon: "warning",
      });
    } else if (assignment.status === "ENDED_WITHOUT_RESPONSE") {
      events.push({
        id: `ended-no-response-${assignment.id}`,
        atTime: assignment.endedAt
          ? new Date(assignment.endedAt).getTime()
          : startedAt,
        order: 3,
        assignmentId: assignment.id,
        title: `${assignment.departmentName} — انتهت الإحالة دون رد`,
        description: null,
        meta: assignment.endedAt
          ? [`تاريخ الانتهاء: ${formatDate(assignment.endedAt)}`]
          : [],
        badge: "ENDED_WITHOUT_RESPONSE",
        warning: true,
        icon: "warning",
      });
    }
  }

  for (const urgency of complaint.urgencies) {
    const atTime = urgency.createdAt ? new Date(urgency.createdAt).getTime() : registeredAt;
    events.push({
      id: `urgency-${urgency.id}`,
      atTime,
      order: 2,
      assignmentId: null,
      title: `استعجال إلى ${urgency.departmentName}`,
      description: null,
      meta: [
        urgency.outgoingLetterNumber
          ? `رقم الصادر: ${urgency.outgoingLetterNumber}`
          : "",
        urgency.outgoingLetterDate
          ? `تاريخ الصادر: ${formatDate(urgency.outgoingLetterDate)}`
          : "",
        formatDate(urgency.createdAt),
      ].filter(Boolean),
      badge: null,
      warning: false,
      icon: "urgency",
    });
  }

  events.sort((a, b) => a.atTime - b.atTime || a.order - b.order);
  return events;
}

function EventIcon({ kind, warning }: { kind: TimelineEvent["icon"]; warning: boolean }) {
  if (kind === "registered") {
    return (
      <div className="size-6 rounded-full bg-primary flex items-center justify-center">
        <Check className="size-3.5 text-white" />
      </div>
    );
  }
  if (kind === "assignment") {
    return (
      <div className="size-6 rounded-full bg-surface-container-high flex items-center justify-center">
        <FileUp className="size-3.5 text-primary" />
      </div>
    );
  }
  if (kind === "response") {
    return (
      <div className="size-6 rounded-full bg-surface-container-high flex items-center justify-center">
        <MessageSquareReply className="size-3.5 text-primary" />
      </div>
    );
  }
  if (kind === "urgency") {
    return (
      <div className="size-6 rounded-full bg-warning/15 flex items-center justify-center">
        <Zap className="size-3.5 text-warning" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "size-6 rounded-full flex items-center justify-center",
        warning ? "bg-destructive/10" : "bg-surface-container-high",
      )}
    >
      <AlertTriangle className={cn("size-3.5", warning ? "text-destructive" : "text-muted-foreground")} />
    </div>
  );
}

export function ComplaintTimeline({ complaint }: ComplaintTimelineProps) {
  const events = useMemo(() => buildEvents(complaint), [complaint]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = complaint.assignmentHistory.find(
    (assignment) => assignment.id === selectedId,
  );

  return (
    <section className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg h-full">
      <h2 className="font-heading text-title-sm md:text-title-md text-foreground mb-6">
        مسار الشكوى
      </h2>

      <ol className="space-y-0">
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          const clickable = event.assignmentId !== null;
          return (
            <li key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast && (
                <div className="absolute right-[11px] top-6 bottom-0 w-px bg-border" />
              )}
              <div className="relative shrink-0">
                <EventIcon kind={event.icon} warning={event.warning} />
              </div>
              <div
                className={cn(
                  "flex-1 min-w-0 pt-0.5",
                  clickable &&
                    "cursor-pointer rounded-lg px-1.5 -mx-1.5 hover:bg-surface-container-low transition-colors",
                )}
                onClick={() => {
                  if (clickable) {
                    setSelectedId(event.assignmentId);
                    setOpen(true);
                  }
                }}
                role={clickable ? "button" : undefined}
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3
                    className={cn(
                      "font-heading text-label-sm",
                      event.warning ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {event.title}
                  </h3>
                  {event.badge && <AssignmentStatusBadge status={event.badge} />}
                </div>
                {event.description && (
                  <p className="text-body-sm text-muted-foreground mb-1 whitespace-pre-wrap break-words">
                    {event.description}
                  </p>
                )}
                <div
                  className={cn(
                    "flex items-center gap-3 text-label-xs flex-wrap",
                    event.warning ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {event.icon === "registered" && (
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {event.meta[0]}
                    </span>
                  )}
                  {event.icon === "warning" && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {event.meta.join(" · ")}
                    </span>
                  )}
                  {event.icon === "assignment" && (
                    <span>{event.meta.join(" · ")}</span>
                  )}
                  {event.icon === "response" && (
                    <span>
                      {event.meta.join(" · ") ||
                        formatDate(new Date(event.atTime).toISOString())}
                    </span>
                  )}
                  {event.icon === "urgency" && (
                    <span className="flex items-center gap-1">
                      <Zap className="size-3 text-warning" />
                      {event.meta.join(" · ")}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {selected && (
        <ComplaintAssignmentDetailsDialog
          key={selected.id}
          open={open}
          onOpenChange={setOpen}
          displayId={complaint.displayId}
          assignment={selected}
          departmentAssignments={complaint.assignmentHistory.filter(
            (assignment) => assignment.departmentId === selected.departmentId,
          )}
        />
      )}
    </section>
  );
}