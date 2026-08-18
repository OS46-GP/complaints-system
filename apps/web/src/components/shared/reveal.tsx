import type { ReactNode } from "react";
import { AnimateIn } from "@/components/shared/animate";

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
  return (
    <AnimateIn as={Tag} delay={delay} variant="slide-up" className={className}>
      {children}
    </AnimateIn>
  );
}
