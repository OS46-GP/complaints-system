// Tool input type definition for draft-report
// Used by AgentService to structure reporting data sent to the AI model.

export interface AchievementRow {
  department: string;
  total: number;
  finished: number;
  percentage: number;
}

export interface DelayRow {
  department: string;
  overdueCount: number;
  avgDaysOverdue: number;
}

export interface DraftReportInput {
  periodLabel: string;
  periodFrom: string;
  periodTo: string;
  achievementRows: AchievementRow[];
  delayRows: DelayRow[];
  totalComplaints: number;
  totalFinished: number;
}
