import { Upload, FileText, Image, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintFileItem } from "@/types/complaint-details.types";

interface ComplaintEvidenceGalleryProps {
  files: ComplaintFileItem[];
  onUpload?: () => void;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return Image;
  return FileText;
}

function formatBytes(key: string) {
  return key ? `${(key.length / 1024).toFixed(1)} KB` : "";
}

export function ComplaintEvidenceGallery({
  files,
  onUpload,
}: ComplaintEvidenceGalleryProps) {
  const images = files.filter((f) => f.fileType.startsWith("image/"));
  const docs = files.filter((f) => !f.fileType.startsWith("image/"));

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-headline-md text-primary flex items-center gap-2">
          <FileText className="size-5" />
          الأدلة والمرفقات ({files.length})
        </h3>
        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="text-primary font-heading text-label-sm flex items-center gap-1 hover:underline"
          >
            <Upload className="size-4" />
            رفع جديد
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {images.map((file) => (
          <div
            key={file.id}
            className="group relative rounded-lg overflow-hidden aspect-video border border-border cursor-pointer bg-surface-container-high"
          >
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Image className="size-8" />
            </div>
            <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Eye className="size-5 text-white" />
              <Download className="size-5 text-white" />
            </div>
          </div>
        ))}

        {docs.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="size-10 bg-secondary-container rounded flex items-center justify-center shrink-0">
              {getFileIcon(file.fileType) === FileText ? (
                <FileText className="size-5 text-secondary-foreground" />
              ) : (
                <Image className="size-5 text-secondary-foreground" />
              )}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-foreground font-heading text-label-sm truncate">
                {file.storageKey.split("/").pop() || file.storageKey}
              </p>
              <p className="text-muted-foreground font-heading text-[10px]">
                {formatBytes(file.storageKey)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
