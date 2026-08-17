import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Building2,
  CalendarClock,
  CircleCheck,
  ClipboardList,
  Cloud,
  Code2,
  Columns3,
  Database,
  FileBarChart,
  FileSearch,
  FileSpreadsheet,
  FileStack,
  Globe,
  GraduationCap,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogIn,
  Mail,
  MonitorSmartphone,
  Palette,
  PieChart,
  PlayCircle,
  PlusCircle,
  Radio,
  Rocket,
  ScanLine,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  SquareKanban,
  User,
  Users,
  Workflow,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  EndpointTable,
  FeatureBadge,
  GlassCard,
  GradientText,
  IconBadge,
  SlideHeading,
  SlideKicker,
  SlideScrollable,
  StaggerItem,
  type EndpointGroup,
  type LucideIcon,
} from "./primitives";

const TEAM = [
  "Mahmoud Halim",
  "Mohamed Nassar",
  "Mahmoud Ismail",
  "Mostafa Safwat",
  "Amir Whdan",
];

const SYSTEM_TAGLINE =
  "An institutional platform to receive, track, examine and respond to citizen complaints — with OCR intake, AI triage, social media monitoring and powerful reporting.";

/* ------------------------------------------------------------------ */
/* Title                                                                */
/* ------------------------------------------------------------------ */

export function TitleSlide() {
  const floating = [
    { icon: ClipboardList, className: "left-[8%] top-[18%]", delay: "0s" },
    { icon: Inbox, className: "right-[10%] top-[22%]", delay: "-1.5s" },
    { icon: ScanLine, className: "left-[12%] bottom-[22%]", delay: "-3s" },
    { icon: Bot, className: "right-[12%] bottom-[26%]", delay: "-4.5s" },
    { icon: ShieldCheck, className: "left-[22%] top-[38%]", delay: "-2.5s" },
    { icon: BarChart3, className: "right-[22%] top-[42%]", delay: "-0.8s" },
  ];

  return (
    <SlideScrollable>
      {floating.map((f, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "absolute z-0 hidden text-primary/25 lg:block animate-float",
            f.className,
          )}
          style={{ animationDelay: f.delay }}
        >
          <f.icon className="size-12" strokeWidth={1.5} />
        </span>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-7 text-center">
        <StaggerItem delay={0}>
          <SlideKicker>
            <GraduationCap className="size-3.5" />
            Graduation Project
          </SlideKicker>
        </StaggerItem>

        <StaggerItem delay={120}>
          <h1 className="font-heading text-5xl font-bold leading-none tracking-tight sm:text-6xl lg:text-7xl">
            <GradientText>Complaints</GradientText>
            <br />
            Management System
          </h1>
        </StaggerItem>

        <StaggerItem delay={240}>
          <p className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {SYSTEM_TAGLINE}
          </p>
        </StaggerItem>

        <StaggerItem delay={360} className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {TEAM.map((member) => (
            <span
              key={member}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 font-mono text-[0.6rem] font-bold text-primary">
                {member
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
              {member}
            </span>
          ))}
        </StaggerItem>

        <StaggerItem delay={480}>
          <div className="mt-2 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-px w-10 bg-border" />
            React · NestJS · PostgreSQL
            <span className="h-px w-10 bg-border" />
          </div>
        </StaggerItem>
      </div>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* Agenda                                                               */
/* ------------------------------------------------------------------ */

const AGENDA = [
  "Introduction",
  "Objectives",
  "Technologies Used",
  "System Features",
  "System Architecture",
  "Backend Walkthrough",
  "Frontend Walkthrough",
  "System Demonstration",
  "Future Enhancements",
  "Conclusion",
];

export function AgendaSlide() {
  return (
    <SlideScrollable>
      <SlideHeading kicker="Agenda" title="What we will cover" />
      <div className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
        {AGENDA.map((item, i) => (
          <StaggerItem key={item} delay={i * 60}>
            <div className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/70 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-container font-mono text-sm font-bold text-primary-foreground shadow-sm transition-transform group-hover:scale-110">
                {i + 1}
              </span>
              <span className="font-heading text-lg font-semibold text-foreground">
                {item}
              </span>
            </div>
          </StaggerItem>
        ))}
      </div>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* Introduction                                                        */
/* ------------------------------------------------------------------ */

const INTRO_ENTITIES = [
  { icon: ClipboardList, label: "Complaints" },
  { icon: User, label: "Citizens" },
  { icon: Building2, label: "Departments" },
  { icon: FileStack, label: "Letters" },
  { icon: FileBarChart, label: "Reports" },
  { icon: Radio, label: "Social Media" },
];

export function IntroductionSlide() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="01 · Introduction"
        icon={Sparkles}
        title={
          <>
            <GradientText>Institutional</GradientText> Complaints Management
          </>
        }
      />
      <GlassCard className="w-full max-w-3xl p-7 text-center">
        <p className="font-body text-lg leading-relaxed text-foreground/90 sm:text-xl">
          A <strong className="text-primary">full-stack system</strong> that helps
          organizations manage the entire citizen complaint workflow — intake,
          examination, department routing, responses, letters and archiving — via
          a <strong className="text-primary">secure</strong>,{" "}
          <strong className="text-primary">role-based</strong> web platform enhanced
          with <strong className="text-primary">OCR</strong> and{" "}
          <strong className="text-primary">AI</strong>.
        </p>
      </GlassCard>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {INTRO_ENTITIES.map((e, i) => (
          <StaggerItem key={e.label} delay={i * 80}>
            <FeatureBadge icon={e.icon} label={e.label} tone={i % 2 === 0 ? "primary" : "tertiary"} />
          </StaggerItem>
        ))}
      </div>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* Objectives                                                          */
/* ------------------------------------------------------------------ */

const OBJECTIVES = [
  {
    icon: Workflow,
    title: "Digitize the Lifecycle",
    text: "Move the full complaint flow — intake to response to archive — online.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Role-based Access",
    text: "JWT authentication for Super Admin, Admin and Official roles.",
  },
  {
    icon: ScanLine,
    title: "OCR & AI Intake",
    text: "Scan documents and use AI triage, duplicate detection & summarization.",
  },
  {
    icon: BarChart3,
    title: "Reporting & Analytics",
    text: "KPIs, custom builders, scheduled reports and Excel / PDF exports.",
  },
  {
    icon: Radio,
    title: "Social Monitoring & Letters",
    text: "Track social media complaints and generate official letters.",
  },
];

export function ObjectivesSlide() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="02 · Objectives"
        icon={CircleCheck}
        title="What we aim to achieve"
      />
      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {OBJECTIVES.map((o, i) => (
          <StaggerItem key={o.title} delay={i * 90} className={cn(i === 4 && "lg:col-start-2")}>
            <div className="group h-full rounded-2xl border border-border/50 bg-card/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              <IconBadge icon={o.icon} tone={i % 2 === 0 ? "primary" : "tertiary"} className="mb-4 transition-transform group-hover:scale-110" />
              <h3 className="mb-1.5 font-heading text-lg font-semibold text-foreground">
                {o.title}
              </h3>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                {o.text}
              </p>
            </div>
          </StaggerItem>
        ))}
      </div>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* Technologies                                                        */
/* ------------------------------------------------------------------ */

const TECHNOLOGIES = [
  {
    icon: MonitorSmartphone,
    tone: "primary" as const,
    title: "Frontend",
    accent: "React",
    items: [
      "React 19 + TypeScript",
      "Vite + Tailwind CSS v4",
      "React Router + TanStack Query",
      "shadcn/ui · Recharts · Zod",
    ],
  },
  {
    icon: Server,
    tone: "tertiary" as const,
    title: "Backend",
    accent: "NestJS",
    items: [
      "NestJS (Express) · JWT + Passport",
      "Prisma ORM · class-validator",
      "Mastra AI + Google Gemini",
      "Tesseract OCR · ExcelJS · Apify",
    ],
  },
  {
    icon: Database,
    tone: "muted" as const,
    title: "Database",
    accent: "PostgreSQL",
    items: ["PostgreSQL", "Prisma Migrations & Seed"],
  },
];

export function TechnologiesSlide() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="03 · Technologies Used"
        icon={Code2}
        title="The tech stack"
      />
      <div className="grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
        {TECHNOLOGIES.map((t, i) => (
          <StaggerItem key={t.title} delay={i * 120} className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-border/50 bg-card/70 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              <IconBadge icon={t.icon} tone={t.tone} className="mb-4 size-12 rounded-xl" />
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
                {t.accent}
              </p>
              <h3 className="mb-4 font-heading text-2xl font-bold text-foreground">
                {t.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {t.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/50 px-3 py-2 font-body text-sm text-foreground/90"
                  >
                    <CircleCheck className="size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        ))}
      </div>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* System Features                                                     */
/* ------------------------------------------------------------------ */

const MODULES = [
  { icon: ShieldCheck, title: "Authentication & Roles", text: "JWT login for Super Admin, Admin & Official.", tone: "primary" as const },
  { icon: ClipboardList, title: "Complaint Registration", text: "Citizens, types, severity, reception & attachments.", tone: "primary" as const },
  { icon: ScanLine, title: "OCR Intake", text: "Scan documents to auto-fill complaints.", tone: "tertiary" as const },
  { icon: Brain, title: "AI Triage & Summarization", text: "Duplicate detection, severity analysis & summaries.", tone: "primary" as const },
  { icon: Building2, title: "Department Routing", text: "Multi-department assignment, responses & deadlines.", tone: "primary" as const },
  { icon: Radio, title: "Social Media Monitoring", text: "Scraped groups, drafts & polls.", tone: "tertiary" as const },
  { icon: FileStack, title: "Letter Templates", text: "Placeholders, DOCX import & official letters.", tone: "primary" as const },
  { icon: FileBarChart, title: "Reporting & Analytics", text: "KPIs, custom & scheduled reports, Excel export.", tone: "tertiary" as const },
];

export function FeaturesSlide() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="04 · System Features"
        icon={LayoutDashboard}
        title={
          <>
            Eight <GradientText>core modules</GradientText>
          </>
        }
      />
      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map((m, i) => (
          <StaggerItem key={m.title} delay={i * 70} className="h-full">
            <div className="group flex h-full flex-col gap-3 rounded-2xl border border-border/50 bg-card/70 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              <IconBadge icon={m.icon} tone={m.tone} className="transition-transform group-hover:scale-110" />
              <div>
                <h3 className="mb-1 font-heading text-[0.95rem] font-semibold leading-snug text-foreground">
                  {m.title}
                </h3>
                <p className="font-body text-xs leading-relaxed text-muted-foreground">
                  {m.text}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </div>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* System Architecture                                                 */
/* ------------------------------------------------------------------ */

function ArchBox({
  icon: Icon,
  title,
  subtitle,
  tone = "primary",
  delay = 0,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tone?: "primary" | "tertiary" | "muted";
  delay?: number;
}) {
  return (
    <StaggerItem delay={delay}>
      <div className="flex w-full max-w-sm items-center gap-4 rounded-2xl border border-border/50 bg-card/80 px-6 py-4 shadow-lg backdrop-blur-md">
        <IconBadge icon={Icon} tone={tone} className="size-12" />
        <div className="text-left">
          <p className="font-heading text-lg font-bold text-foreground">{title}</p>
          <p className="font-mono text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </StaggerItem>
  );
}

export function ArchitectureSlide() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="05 · System Architecture"
        icon={Workflow}
        title="How everything connects"
      />
      <div className="flex flex-col items-center gap-2">
        <ArchBox icon={MonitorSmartphone} title="Frontend" subtitle="React SPA · Web UI" delay={0} />
        <StaggerItem delay={120}>
          <ArrowDown className="size-6 text-primary/60" />
        </StaggerItem>
        <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          <ArchBox icon={Server} title="Backend" subtitle="NestJS REST API" tone="tertiary" delay={200} />
          <ArchBox icon={KeyRound} title="Auth Layer" subtitle="JWT + Passport" tone="muted" delay={260} />
        </div>
        <StaggerItem delay={320}>
          <ArrowDown className="size-6 text-primary/60" />
        </StaggerItem>
        <ArchBox icon={Database} title="Database" subtitle="PostgreSQL · Prisma" tone="muted" delay={360} />
        <StaggerItem delay={420}>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: ScanLine, label: "OCR · Tesseract" },
              { icon: Brain, label: "AI · Gemini + Mastra" },
              { icon: Radio, label: "Social · Apify" },
            ].map((s) => (
              <span
                key={s.label}
                className="flex items-center gap-1.5 rounded-full border border-border/50 bg-tertiary/10 px-3.5 py-1.5 font-mono text-xs text-tertiary"
              >
                <s.icon className="size-3.5" />
                {s.label}
              </span>
            ))}
          </div>
        </StaggerItem>
      </div>

      <StaggerItem delay={480}>
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="rounded-full border border-border/50 bg-card/70 px-3 py-1.5">
            Admin / Official
          </span>
          <ArrowRight className="size-4 text-primary/60" />
          <span className="rounded-full border border-border/50 bg-card/70 px-3 py-1.5">Web UI</span>
          <ArrowRight className="size-4 text-primary/60" />
          <span className="rounded-full border border-border/50 bg-card/70 px-3 py-1.5">API Calls</span>
          <ArrowRight className="size-4 text-primary/60" />
          <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-semibold text-primary">
            Database
          </span>
        </div>
      </StaggerItem>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* Backend Overview                                                    */
/* ------------------------------------------------------------------ */

const AUTH_GROUP: EndpointGroup = {
  base: "/api/auth",
  rows: [
    { method: "POST", path: "/login", description: "Sign in with username & password (JWT)." },
  ],
};

const PROFILE_GROUP: EndpointGroup = {
  base: "/api/profile",
  rows: [
    { method: "GET", path: "/", description: "Get the current user profile." },
    { method: "PATCH", path: "/", description: "Update profile details." },
    { method: "PATCH", path: "/password", description: "Change the account password." },
  ],
};

const USERS_GROUP: EndpointGroup = {
  base: "/api/users",
  rows: [
    { method: "POST", path: "/", description: "Create a new system user." },
    { method: "GET", path: "/", description: "List users with roles." },
    { method: "GET", path: "/:id", description: "Get a user by id." },
    { method: "PATCH", path: "/:id", description: "Update a user." },
    { method: "DELETE", path: "/:id", description: "Delete a user." },
    { method: "POST", path: "/:id/block", description: "Block a user account." },
    { method: "POST", path: "/:id/unblock", description: "Unblock a user account." },
    { method: "POST", path: "/password-reset-request", description: "Request a password reset." },
    { method: "POST", path: "/password-reset/:id/approve", description: "Approve a reset request." },
    { method: "POST", path: "/password-reset/:id/reject", description: "Reject a reset request." },
  ],
};

const COMPLAINTS_GROUP: EndpointGroup = {
  base: "/api/complaints",
  rows: [
    { method: "POST", path: "/", description: "Register a new complaint." },
    { method: "GET", path: "/", description: "List complaints with filters & search." },
    { method: "GET", path: "/:id", description: "Get a complaint with full details." },
    { method: "PATCH", path: "/:id", description: "Update a complaint." },
    { method: "DELETE", path: "/:id", description: "Delete a complaint." },
    { method: "GET", path: "/assignments/due", description: "List assignments awaiting response." },
    { method: "POST", path: "/:id/departments/:deptId/response", description: "Submit a department response." },
    { method: "POST", path: "/:id/reassign", description: "Reassign the complaint." },
    { method: "POST", path: "/:id/urgency", description: "Mark an urgency / escalation." },
    { method: "POST", path: "/:id/files", description: "Upload complaint attachments." },
    { method: "GET", path: "/:id/files/:fileId/download", description: "Download an attachment." },
  ],
};

const DEPARTMENTS_GROUP: EndpointGroup = {
  base: "/api/departments",
  rows: [
    { method: "GET", path: "/", description: "List departments." },
    { method: "POST", path: "/", description: "Create a department." },
    { method: "PATCH", path: "/:id", description: "Update a department." },
    { method: "DELETE", path: "/:id", description: "Delete a department." },
  ],
};

const COMPLAINT_TYPES_GROUP: EndpointGroup = {
  base: "/api/complaint-types",
  rows: [
    { method: "GET", path: "/", description: "List complaint types." },
    { method: "POST", path: "/", description: "Create a complaint type." },
    { method: "PATCH", path: "/:id", description: "Update a complaint type." },
    { method: "DELETE", path: "/:id", description: "Delete a complaint type." },
  ],
};

const RECEPTION_GROUP: EndpointGroup = {
  base: "/api/reception-methods",
  rows: [
    { method: "GET", path: "/", description: "List reception methods." },
    { method: "POST", path: "/", description: "Create a reception method." },
    { method: "PATCH", path: "/:id", description: "Update a reception method." },
    { method: "DELETE", path: "/:id", description: "Delete a reception method." },
  ],
};

const REPORTS_GROUP: EndpointGroup = {
  base: "/api/reports",
  rows: [
    { method: "GET", path: "/achievement", description: "Achievement KPIs (overall & by department)." },
    { method: "GET", path: "/delays", description: "Delay analysis per department." },
    { method: "POST", path: "/custom", description: "Run a custom report builder." },
    { method: "POST", path: "/custom/export", description: "Export custom report (Excel)." },
    { method: "GET", path: "/scheduled", description: "List scheduled reports." },
    { method: "POST", path: "/generate", description: "Generate an on-demand report." },
    { method: "GET", path: "/:id/export", description: "Export a generated report." },
  ],
};

const AI_GROUP: EndpointGroup = {
  base: "/api/ai",
  rows: [
    { method: "POST", path: "/summarize/:complaintId", description: "Summarize a single complaint." },
    { method: "POST", path: "/summarize-batch", description: "Summarize a batch of complaints." },
    { method: "POST", path: "/draft-report", description: "AI-draft a monthly report." },
    { method: "POST", path: "/draft-selection-report", description: "AI-draft a selection report." },
  ],
};

const INTAKE_GROUP: EndpointGroup = {
  base: "/api/intake",
  rows: [
    { method: "POST", path: "/ocr", description: "OCR a scanned document & extract data." },
  ],
};

const LETTERS_GROUP: EndpointGroup = {
  base: "/api/letter-templates",
  rows: [
    { method: "GET", path: "/", description: "List letter templates." },
    { method: "POST", path: "/", description: "Create a letter template." },
    { method: "PATCH", path: "/:id", description: "Update a letter template." },
    { method: "DELETE", path: "/:id", description: "Delete a letter template." },
    { method: "POST", path: "/import-docx", description: "Import a template from DOCX." },
    { method: "POST", path: "/preview-draft", description: "Preview a generated draft." },
  ],
};

const SOCIAL_GROUP: EndpointGroup = {
  base: "/api/social",
  rows: [
    { method: "POST", path: "/poll", description: "Poll monitored groups for new posts." },
    { method: "GET", path: "/drafts", description: "List social drafts." },
    { method: "GET", path: "/groups", description: "List monitored groups." },
    { method: "POST", path: "/groups/:id/toggle", description: "Enable / disable a group." },
    { method: "POST", path: "/drafts/:id/link", description: "Link a draft to a complaint." },
  ],
};

const NOTIFICATIONS_GROUP: EndpointGroup = {
  base: "/api/notifications",
  rows: [
    { method: "GET", path: "/", description: "List notifications." },
    { method: "GET", path: "/unread-count", description: "Unread notifications count." },
    { method: "PATCH", path: "/:id/read", description: "Mark a notification as read." },
  ],
};

export function BackendSlide1() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="06 · Backend Walkthrough"
        icon={ShieldCheck}
        title={
          <>
            Authentication & <GradientText>Users</GradientText>
          </>
        }
        subtitle="Secure JWT auth, profiles and role-based user management."
      />
      <EndpointTable groups={[AUTH_GROUP, PROFILE_GROUP, USERS_GROUP]} className="lg:grid-cols-2" />
    </SlideScrollable>
  );
}

export function BackendSlide2() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="06 · Backend Walkthrough · Cont'd"
        icon={ClipboardList}
        title={
          <>
            <GradientText>Complaints</GradientText> Core
          </>
        }
        subtitle="The heart of the system — registration, routing, responses and files."
      />
      <EndpointTable groups={[COMPLAINTS_GROUP]} className="lg:grid-cols-1" />
    </SlideScrollable>
  );
}

export function BackendSlide3() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="06 · Backend Walkthrough · Cont'd"
        icon={Building2}
        title="Reference Data"
        subtitle="Departments, complaint types and reception methods power the intake forms."
      />
      <EndpointTable groups={[DEPARTMENTS_GROUP, COMPLAINT_TYPES_GROUP, RECEPTION_GROUP]} className="lg:grid-cols-2" />
    </SlideScrollable>
  );
}

export function BackendSlide4() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="06 · Backend Walkthrough · Cont'd"
        icon={FileBarChart}
        title="Intelligence, Reports & Outputs"
      />
      <EndpointTable
        groups={[REPORTS_GROUP, AI_GROUP, INTAKE_GROUP, LETTERS_GROUP, SOCIAL_GROUP, NOTIFICATIONS_GROUP]}
        className="lg:grid-cols-3"
      />
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* Frontend Overview                                                   */
/* ------------------------------------------------------------------ */

const FRONTEND_PAGES = [
  { icon: LogIn, label: "Login" },
  { icon: LayoutDashboard, label: "Dashboard Page" },
  { icon: ClipboardList, label: "Complaints List Page" },
  { icon: PlusCircle, label: "New Complaint Page" },
  { icon: FileSearch, label: "Complaint Detail Page" },
  { icon: ScanLine, label: "OCR Intake Page" },
  { icon: CalendarClock, label: "Due Assignments Page" },
  { icon: Building2, label: "Departments & Reference Data" },
  { icon: FileStack, label: "Letter Templates Page" },
  { icon: Users, label: "Users Page" },
  { icon: Radio, label: "Social Monitoring Page" },
  { icon: FileBarChart, label: "Reports Hub Page" },
];

export function FrontendOverviewSlide() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="07 · Frontend Walkthrough"
        icon={MonitorSmartphone}
        title={
          <>
            Twelve <GradientText>pages</GradientText>, one flow
          </>
        }
      />
      <div className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
        {FRONTEND_PAGES.map((p, i) => (
          <StaggerItem key={p.label} delay={i * 50}>
            <div className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card/70 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary transition-transform group-hover:scale-110">
                {String.fromCharCode(65 + i)}
              </span>
              <IconBadge icon={p.icon} tone="muted" className="size-8 rounded-md" />
              <span className="font-heading text-sm font-semibold text-foreground">{p.label}</span>
            </div>
          </StaggerItem>
        ))}
      </div>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* Frontend feature slides                                             */
/* ------------------------------------------------------------------ */

function ScreenshotPreview({ src, url }: { src: string; url: string }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-rose-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 flex-1 truncate rounded-md bg-background/70 px-3 py-1 font-mono text-[0.65rem] text-muted-foreground">
          {url}
        </span>
      </div>
      <img
        src={src}
        alt={url}
        loading="lazy"
        className="h-auto w-full animate-in fade-in duration-700 fill-mode-both"
      />
    </div>
  );
}

function FeatureSlide({
  roman,
  title,
  description,
  bullets,
  preview,
}: {
  roman: string;
  title: string;
  description: string;
  bullets: string[];
  preview: ReactNode;
}) {
  return (
    <SlideScrollable className="max-w-[90rem]">
      <div className="flex w-full flex-row items-center justify-center gap-10">
        <div className="flex max-w-md shrink-0 flex-col items-start gap-5 text-start">
          <div className="flex flex-col items-start gap-3 text-start">
            <SlideKicker>
              <MonitorSmartphone className="size-3.5" />
              Frontend Overview · Cont'd
            </SlideKicker>
            <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              <span className="mr-3 bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">
                {roman}
              </span>
              {title}
            </h2>
          </div>

          <p className="font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
          <ul className="flex flex-col items-start gap-2">
            {bullets.map((b, i) => (
              <li
                key={b}
                className="flex items-center gap-2.5 font-body text-sm text-foreground/90 animate-in fade-in slide-in-from-bottom-1 fill-mode-both motion-reduce:animate-none"
                style={{ animationDelay: `${300 + i * 80}ms` }}
              >
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <StaggerItem delay={150} className="min-w-0 flex-1">
          {preview}
        </StaggerItem>
      </div>
    </SlideScrollable>
  );
}

export function FrontendHomeSlide() {
  return (
    <FeatureSlide
      roman="I."
      title="Login"
      description="Secure sign-in with role-based access (Super Admin / Admin / Official). New users are created by admins from the dashboard's Users page, not via self-registration."
      bullets={["JWT authentication for all roles", "Users created by admins from dashboard", "Role-aware redirects"]}
      preview={<ScreenshotPreview src="/presentation/login.png" url="localhost:5173/login" />}
    />
  );
}

export function FrontendDashboardSlide() {
  return (
    <FeatureSlide
      roman="II."
      title="Dashboard"
      description="Provides an overview of the system: total complaints, open & delayed items, resolution KPIs, quick actions, a status donut and delay analytics."
      bullets={["Complaints & status counters", "Delays and achievement analytics", "Quick action shortcuts"]}
      preview={<ScreenshotPreview src="/presentation/dashboard.png" url="localhost:5173/admin/dashboard" />}
    />
  );
}

export function FrontendComplaintsSlide() {
  return (
    <FeatureSlide
      roman="III."
      title="Complaints List"
      description="Displays complaints with powerful filtering and search, batch actions, and card or table views with full status visibility."
      bullets={["Filter by department, type & status", "Search and batch AI actions", "Table and card views"]}
      preview={<ScreenshotPreview src="/presentation/complaints.png" url="localhost:5173/admin/complaints" />}
    />
  );
}

export function FrontendNewComplaintSlide() {
  return (
    <FeatureSlide
      roman="IV."
      title="New Complaint"
      description="A guided multi-step wizard that captures citizen details, complaint info, attachments and a final review before submission."
      bullets={["Multi-step wizard flow", "Citizen lookup by national ID", "Attachments & review step"]}
      preview={<ScreenshotPreview src="/presentation/new-complaint.png" url="localhost:5173/admin/complaints/new" />}
    />
  );
}

export function FrontendComplaintDetailSlide() {
  return (
    <FeatureSlide
      roman="V."
      title="Complaint Detail"
      description="A rich detail page with timeline, examination status, department responses, evidence gallery, related links and quick actions."
      bullets={["Lifecycle timeline & statuses", "Evidence gallery & attachments", "Responses, urgency & actions"]}
      preview={<ScreenshotPreview src="/presentation/complaint-detail.png" url="localhost:5173/admin/complaints/:id" />}
    />
  );
}

export function FrontendDepartmentsSlide() {
  return (
    <FeatureSlide
      roman="VI."
      title="Departments & Reference Data"
      description="Manage departments, complaint types and reception methods that power the intake forms and routing workflow."
      bullets={["Departments management", "Complaint types & reception methods", "Simple CRUD interfaces"]}
      preview={<ScreenshotPreview src="/presentation/departments.png" url="localhost:5173/admin/departments" />}
    />
  );
}

export function FrontendOcrSlide() {
  return (
    <FeatureSlide
      roman="VII."
      title="OCR Intake"
      description="Scan a paper complaint document and let OCR auto-extract citizen data and complaint details into the form."
      bullets={["Tesseract-based OCR extraction", "Auto-fill citizen & subject fields", "Fast document intake"]}
      preview={<ScreenshotPreview src="/presentation/ocr.png" url="localhost:5173/admin/complaints/ocr" />}
    />
  );
}

export function FrontendAssignmentsSlide() {
  return (
    <FeatureSlide
      roman="VIII."
      title="Due Assignments"
      description="Lists complaints assigned to the current user that are awaiting response, with response deadlines and status tracking."
      bullets={["Awaiting-response list", "Deadline progress indicators", "Respond directly from the list"]}
      preview={<ScreenshotPreview src="/presentation/assignments-due.png" url="localhost:5173/admin/assignments/due" />}
    />
  );
}

export function FrontendLettersSlide() {
  return (
    <FeatureSlide
      roman="IX."
      title="Letter Templates"
      description="Create official letter templates with placeholders, import from DOCX, preview drafts and generate letters and PDFs."
      bullets={["Template builder with placeholders", "DOCX import & live preview", "Generate official letters / PDFs"]}
      preview={<ScreenshotPreview src="/presentation/letter-templates.png" url="localhost:5173/admin/letter-templates" />}
    />
  );
}

export function FrontendReportsSlide() {
  return (
    <FeatureSlide
      roman="X."
      title="Reports Hub"
      description="Achievement KPIs, delay analysis, a custom report builder, scheduled and on-demand reports — with Excel and PDF export."
      bullets={["Achievement & delay analytics", "Custom report builder", "Scheduled reports + exports"]}
      preview={<ScreenshotPreview src="/presentation/reports.png" url="localhost:5173/admin/reports" />}
    />
  );
}

export function FrontendSocialSlide() {
  return (
    <FeatureSlide
      roman="XI."
      title="Social Media Monitoring"
      description="Monitors scraped social groups for potential complaints, keeps drafts, and links relevant posts to complaint records."
      bullets={["Scrape monitored groups", "Review & link drafts to complaints", "Group enable / disable controls"]}
      preview={<ScreenshotPreview src="/presentation/social.png" url="localhost:5173/admin/social-monitoring" />}
    />
  );
}

/* ------------------------------------------------------------------ */
/* System Demonstration                                                */
/* ------------------------------------------------------------------ */

export function DemoSlide() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="08 · System Demonstration"
        icon={PlayCircle}
        title="See it in action"
      />
      <StaggerItem delay={150}>
        <div className="group flex w-full max-w-2xl cursor-pointer flex-col items-center gap-4 rounded-3xl border border-border/50 bg-card/70 p-10 text-center shadow-xl backdrop-blur-md transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl">
          <span className="relative flex size-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <span className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container shadow-lg transition-transform group-hover:scale-110">
              <PlayCircle className="size-9 text-primary-foreground" />
            </span>
          </span>
          <div>
            <h3 className="mb-1 font-heading text-2xl font-bold text-foreground">
              Full walkthrough video
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              Live demo of the Complaints Management System end to end.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted px-4 py-1.5 font-mono text-xs text-muted-foreground">
            <Globe className="size-3.5" />
            Video Link
          </span>
        </div>
      </StaggerItem>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* Future Enhancements                                                 */
/* ------------------------------------------------------------------ */

const FUTURE = [
  { icon: Smartphone, label: "Mobile App (React Native / Flutter)" },
  { icon: Mail, label: "Email / SMS Notifications" },
  { icon: Bot, label: "AI Chatbot Assistant with NLP" },
  { icon: PieChart, label: "Advanced Charts & Dashboards" },
  { icon: Cloud, label: "Deployment on Docker + Cloud (AWS)" },
  { icon: Users, label: "Citizen Self-Service Portal" },
  { icon: Globe, label: "Multi-Language UI (AR / EN)" },
  { icon: FileSpreadsheet, label: "More Report Exports (Excel / PDF)" },
  { icon: ShieldCheck, label: "Audit Trail & Soft-Delete Recovery" },
];

export function FutureSlide() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="09 · Future Enhancements"
        icon={Rocket}
        title={
          <>
            The road <GradientText>ahead</GradientText>
          </>
        }
      />
      <div className="grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FUTURE.map((f, i) => (
          <StaggerItem key={f.label} delay={i * 60} className="h-full">
            <div className="group flex h-full items-center gap-3 rounded-xl border border-border/50 bg-card/70 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary transition-transform group-hover:scale-110">
                {i + 1}
              </span>
              <IconBadge icon={f.icon} tone={i % 2 === 0 ? "primary" : "tertiary"} className="size-8 rounded-md" />
              <span className="font-heading text-sm font-semibold text-foreground">{f.label}</span>
            </div>
          </StaggerItem>
        ))}
      </div>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* Conclusion                                                          */
/* ------------------------------------------------------------------ */

export function ConclusionSlide() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="10 · Conclusion"
        icon={CircleCheck}
        title={
          <>
            A modern, <GradientText>scalable</GradientText> complaints platform
          </>
        }
      />
      <GlassCard className="w-full max-w-3xl p-8">
        <p className="font-body text-lg leading-relaxed text-foreground/90 sm:text-xl">
          The Complaints Management System provides a{" "}
          <strong className="text-primary">modern, scalable solution</strong> for
          handling institutional complaint workflows. Built on{" "}
          <strong className="text-primary">React, NestJS and PostgreSQL</strong>, it
          includes OCR intake, AI triage &amp; summarization, social media
          monitoring, letter generation and an intuitive interface tailored for
          government workflows.
        </p>
      </GlassCard>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <FeatureBadge icon={ScanLine} label="OCR Intake" tone="primary" />
        <FeatureBadge icon={Brain} label="AI Triage & Summaries" tone="tertiary" />
        <FeatureBadge icon={Radio} label="Social Monitoring" tone="primary" />
        <FeatureBadge icon={FileBarChart} label="Reporting" tone="tertiary" />
      </div>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* References                                                          */
/* ------------------------------------------------------------------ */

const REFERENCES = [
  { icon: Code2, label: "GitHub Frontend", hint: "Source code · web" },
  { icon: Server, label: "GitHub Backend", hint: "Source code · api" },
  { icon: SquareKanban, label: "Trello", hint: "Project board" },
  { icon: BookOpen, label: "API Documentation", hint: "Bruno · OpenAPI" },
  { icon: Palette, label: "Figma", hint: "UI designs" },
];

export function ReferencesSlide() {
  return (
    <SlideScrollable>
      <SlideHeading
        kicker="References"
        icon={Columns3}
        title="Useful links"
      />
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {REFERENCES.map((r, i) => (
          <StaggerItem key={r.label} delay={i * 80}>
            <div className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-card/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              <IconBadge icon={r.icon} tone={i % 2 === 0 ? "primary" : "tertiary"} className="transition-transform group-hover:scale-110" />
              <div className="min-w-0">
                <p className="font-heading text-base font-semibold text-foreground">{r.label}</p>
                <p className="font-mono text-xs text-muted-foreground">{r.hint}</p>
              </div>
              <ArrowRight className="ml-auto size-4 shrink-0 text-primary/50 transition-transform group-hover:translate-x-1" />
            </div>
          </StaggerItem>
        ))}
      </div>
    </SlideScrollable>
  );
}

/* ------------------------------------------------------------------ */
/* Thank you                                                           */
/* ------------------------------------------------------------------ */

export function ThanksSlide() {
  return (
    <SlideScrollable>
      <div className="relative z-10 flex flex-col items-center gap-7 text-center">
        <StaggerItem delay={0}>
          <SlideKicker>
            <Sparkles className="size-3.5" />
            Questions?
          </SlideKicker>
        </StaggerItem>
        <StaggerItem delay={120}>
          <h1 className="font-heading text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            Thank <GradientText>You!</GradientText>
          </h1>
        </StaggerItem>
        <StaggerItem delay={240}>
          <p className="font-body text-lg text-muted-foreground sm:text-xl">
            Feel free to ask any questions.
          </p>
        </StaggerItem>
        <StaggerItem delay={360} className="flex flex-wrap items-center justify-center gap-3">
          {TEAM.map((member, i) => (
            <span
              key={member}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm",
                i % 2 === 0
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-tertiary/30 bg-tertiary/10 text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full font-mono text-[0.6rem] font-bold",
                  i % 2 === 0 ? "bg-primary/20 text-primary" : "bg-tertiary/20 text-tertiary",
                )}
              >
                {member.split(" ").map((w) => w[0]).join("")}
              </span>
              {member}
            </span>
          ))}
        </StaggerItem>
      </div>
    </SlideScrollable>
  );
}