export type ComplaintPriority = "high" | "medium" | "low";

export type ComplaintStatus = "in-progress" | "resolved" | "closed" | "review";

export interface ComplaintAssignee {
  name: string;
  avatar?: string;
  initials?: string;
}

export interface Complaint {
  id: string;
  displayId: string;
  subject: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignee: ComplaintAssignee;
  timeAgo: string;
}

export interface StatCardData {
  icon: string;
  label: string;
  value: string;
  trend: { text: string; color: string; icon: string };
}
