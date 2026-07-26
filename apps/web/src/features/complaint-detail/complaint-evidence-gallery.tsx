import { Upload, FileText, Image, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintFileItem } from "@/features/complaint-detail/types";

interface ComplaintEvidenceGalleryProps {
  files: ComplaintFileItem[];
  onUpload?: () => void;
}

function isImageFile(file: ComplaintFileItem) {
  return file.fileType.startsWith("image/");
}

function getFileIcon(file: ComplaintFileItem) {
  if (isImageFile(file)) return <Image className="size-12 text-muted-foreground" />;
  return <FileText className="size-12 text-muted-foreground" />;
}

export function ComplaintEvidenceGallery({
  files,
  onUpload,
}: ComplaintEvidenceGalleryProps) {
  const imageFiles = files.filter(isImageFile);
  const docFiles = files.filter((f) => !isImageFile(f));

  return (
    <section className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-title-sm md:text-title-md text-foreground">
          المرفقات
        </h2>
        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="flex items-center gap-2 text-label-sm font-heading text-primary hover:text-primary/80 transition-colors"
          >
            <Upload className="size-4" />
            إرفاق ملف
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <p className="text-body-sm text-muted-foreground text-center py-8">
          لا توجد مرفقات
        </p>
      ) : (
        <div className="space-y-4">
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {imageFiles.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "group relative aspect-square rounded-lg overflow-hidden",
                    "border border-border bg-surface-container-high"
                  )}
                >
                  <div className="flex items-center justify-center h-full">
                    <Image className="size-8 text-muted-foreground/50" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      title="عرض"
                    >
                      <Eye className="size-4 text-white" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      title="تحميل"
                    >
                      <Download className="size-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {docFiles.length > 0 && (
            <div className="space-y-2">
              {docFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-container-high"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(file)}
                    <div className="min-w-0">
                      <p className="font-heading text-label-sm text-foreground truncate">
                        {file.storageKey}
                      </p>
                      <p className="text-label-xs text-muted-foreground">
                        {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
                      title="عرض"
                    >
                      <Eye className="size-4 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
                      title="تحميل"
                    >
                      <Download className="size-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
