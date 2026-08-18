import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AnimateIn } from "@/components/shared/animate";

export type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

const METHOD_STYLES: Record<Method, string> = {
  GET: "bg-emerald-500/15 text-emerald-700 ring-emerald-600/30 dark:text-emerald-300",
  POST: "bg-sky-500/15 text-sky-700 ring-sky-600/30 dark:text-sky-300",
  PATCH: "bg-amber-500/15 text-amber-700 ring-amber-600/30 dark:text-amber-300",
  PUT: "bg-violet-500/15 text-violet-700 ring-violet-600/30 dark:text-violet-300",
  DELETE:
    "bg-rose-500/15 text-rose-700 ring-rose-600/30 dark:text-rose-300",
};

export interface EndpointRow {
  method: Method;
  path: string;
  description: string;
}

export interface EndpointGroup {
  base: string;
  rows: EndpointRow[];
}

const ANIMATED_BACKGROUNDS = ["animate-float", "animate-blob"];

export function SlideKicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SlideHeading({
  kicker,
  title,
  subtitle,
  icon: Icon,
  className,
}: {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
      {kicker && (
        <SlideKicker>
          {Icon && <Icon className="size-3.5" />}
          {kicker}
        </SlideKicker>
      )}
      <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function GradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-primary via-primary-container to-tertiary bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function GlassCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimateIn
      delay={delay}
      variant="zoom"
      duration="duration-700"
      className={cn(
        "rounded-2xl border border-border/50 bg-card/70 p-5 shadow-[0_8px_40px_-12px_rgba(0,104,95,0.18)] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </AnimateIn>
  );
}

export function IconBadge({
  icon: Icon,
  tone = "primary",
  className,
}: {
  icon: LucideIcon;
  tone?: "primary" | "tertiary" | "muted";
  className?: string;
}) {
  const tones = {
    primary:
      "bg-primary/12 text-primary ring-primary/30",
    tertiary:
      "bg-tertiary/12 text-tertiary ring-tertiary/30",
    muted: "bg-muted text-muted-foreground ring-border",
  };
  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-xl ring-1",
        tones[tone],
        className,
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}

export function StaggerItem({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <AnimateIn
      delay={delay}
      variant="slide-up"
      duration="duration-700"
      className={className}
    >
      {children}
    </AnimateIn>
  );
}

export function EndpointTable({
  groups,
  className,
}: {
  groups: EndpointGroup[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full gap-4 lg:grid-cols-2",
        className,
      )}
    >
      {groups.map((group, gi) => (
        <div
          key={group.base}
          className="overflow-hidden rounded-2xl border border-border/50 bg-card/70 shadow-sm backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-border/60 bg-primary/8 px-4 py-2.5">
            <code className="font-mono text-sm font-semibold text-primary">
              {group.base}
            </code>
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              {group.rows.length} {group.rows.length === 1 ? "endpoint" : "endpoints"}
            </span>
          </div>
          <ul className="divide-y divide-border/40">
            {group.rows.map((row, ri) => (
              <li
                key={`${group.base}${row.path}${ri}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50",
                  gi === 0 && "animate-in fade-in slide-in-from-bottom-2 fill-mode-both",
                )}
                style={
                  gi === 0
                    ? ({ "--tw-animation-delay": `${150 + gi * 120 + ri * 70}ms` } as CSSProperties)
                    : undefined
                }
              >
                <span
                  className={cn(
                    "w-16 shrink-0 rounded-md px-1.5 py-0.5 text-center font-mono text-[0.68rem] font-bold ring-1",
                    METHOD_STYLES[row.method],
                  )}
                >
                  {row.method}
                </span>
                <code className="w-32 shrink-0 truncate font-mono text-[0.8rem] text-foreground sm:w-40">
                  {row.path}
                </code>
                <span className="min-w-0 flex-1 text-[0.8rem] leading-snug text-muted-foreground">
                  {row.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function FeatureBadge({
  icon: Icon,
  label,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  tone?: "primary" | "tertiary" | "muted";
}) {
  const tones = {
    primary: "text-primary",
    tertiary: "text-tertiary",
    muted: "text-muted-foreground",
  };
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3.5 py-1.5 text-[0.78rem] font-medium text-foreground shadow-sm">
      <Icon className={cn("size-3.5", tones[tone])} />
      {label}
    </span>
  );
}

export function BackgroundOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/15 blur-3xl animate-blob" />
      <div
        className={cn(
          "absolute -bottom-32 -right-24 size-[28rem] rounded-full bg-tertiary/12 blur-3xl",
          ANIMATED_BACKGROUNDS[1],
        )}
        style={{ animationDelay: "-4s" }}
      />
      <div
        className={cn(
          "absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl",
          ANIMATED_BACKGROUNDS[1],
        )}
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}

export function SlideScrollable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto px-6 py-10 sm:px-10">
      <div
        className={cn(
          "flex w-full max-w-6xl flex-col items-center gap-8",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export type { LucideIcon };
