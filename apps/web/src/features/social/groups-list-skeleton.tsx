import { Skeleton } from "@/components/ui/skeleton";

export function GroupsListSkeleton() {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-container-lowest">
      {[1, 2, 3].map((i) => (
        <li key={i} className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-10" />
        </li>
      ))}
    </ul>
  );
}
