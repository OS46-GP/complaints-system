import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "tr";
}) {
  const style = delay
    ? ({ "--tw-animation-delay": `${delay}ms` } as CSSProperties)
    : undefined;

  return (
    <Tag
      style={style}
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-both",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
