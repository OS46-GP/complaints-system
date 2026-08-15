import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  ANIMATION_VARIANTS,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_ANIMATION_EASE,
  type AnimationVariant,
} from "@/components/shared/animation";

interface AnimateInProps {
  children: ReactNode;
  as?: "div" | "li" | "tr" | "span";
  /** Animation delay in ms (used to stagger sibling items). */
  delay?: number;
  /** Preset combination of enter effects. Defaults to `slide-up`. */
  variant?: AnimationVariant;
  /** Tailwind duration utility, e.g. `duration-300` / `duration-700`. */
  duration?: string;
  /** Tailwind easing utility or arbitrary `ease-[...]` value. */
  ease?: string;
  className?: string;
  /** Set to `false` to force no animation for this element. */
  animate?: boolean;
}

export function AnimateIn({
  children,
  as: Tag = "div",
  delay = 0,
  variant = "slide-up",
  duration = DEFAULT_ANIMATION_DURATION,
  ease = DEFAULT_ANIMATION_EASE,
  className,
  animate = true,
}: AnimateInProps) {
  const style =
    animate && delay
      ? ({ "--tw-animation-delay": `${delay}ms` } as CSSProperties)
      : undefined;

  return (
    <Tag
      style={style}
      className={cn(
        animate &&
          `animate-in ${ANIMATION_VARIANTS[variant]} ${duration} ${ease} fill-mode-both motion-reduce:animate-none`,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
