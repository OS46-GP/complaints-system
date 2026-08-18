import { useRef } from "react";
import { ImagePlus, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolveDownloadUrl } from "@/features/reporting/api";

export function ImageUploadField({
  src,
  busy,
  disabled,
  onUpload,
  helper,
}: {
  src: string | null;
  busy: boolean;
  disabled: boolean;
  onUpload: (file: File) => void;
  helper?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      {src ? (
        <img
          src={resolveDownloadUrl(src)}
          alt=""
          className="max-h-40 rounded-lg border border-border bg-white object-contain"
        />
      ) : (
        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border text-label-sm text-muted-foreground">
          لا توجد صورة بعد
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 self-start"
        onClick={() => inputRef.current?.click()}
        disabled={busy || disabled}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : src ? (
          <RefreshCw className="size-4" />
        ) : (
          <ImagePlus className="size-4" />
        )}
        {busy ? "جارٍ الرفع..." : src ? "تغيير الصورة" : "رفع صورة"}
      </Button>
      {helper && <p className="text-label-sm text-muted-foreground">{helper}</p>}
    </div>
  );
}