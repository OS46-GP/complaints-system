import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = "جارٍ التحميل..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <span className="font-body text-body-md text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
