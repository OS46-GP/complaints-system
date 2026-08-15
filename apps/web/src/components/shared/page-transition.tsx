import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { AnimateIn } from "@/components/shared/animate";

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <AnimateIn key={location.pathname} variant="page">
      {children}
    </AnimateIn>
  );
}
