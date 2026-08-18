import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function SkeletonCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-4 md:p-6 space-y-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="size-4 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ComplaintDetailsSkeleton() {
  return (
    <>
      <div className="mb-6 md:mb-10 flex items-center justify-between">
        <div className="text-right space-y-2">
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 w-full">
        <div className="col-span-12 lg:col-span-5 space-y-4 md:space-y-6">
          <SkeletonCard>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </SkeletonCard>

          <SkeletonCard>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </SkeletonCard>

          <SkeletonCard>
            <Skeleton className="h-5 w-28" />
            <div className="grid grid-cols-3 gap-3 pt-1">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="aspect-square w-full rounded-lg" />
            </div>
          </SkeletonCard>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <SkeletonCard>
            <Skeleton className="h-5 w-32" />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </SkeletonCard>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-4 md:space-y-6">
          <SkeletonCard>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </SkeletonCard>

          <SkeletonCard>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </SkeletonCard>

          <SkeletonCard>
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </SkeletonCard>
        </div>
      </div>
    </>
  );
}
