import { useRef, useState, useCallback } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface FileItem {
  file: File;
  id: string;
}

interface FileUploadAreaProps {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUploadArea({
  files,
  onFilesChange,
  accept = ".pdf,.jpg,.png",
  maxSizeMB = 10,
}: FileUploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newItems = Array.from(incoming).map((file) => ({
        file,
        id: crypto.randomUUID(),
      }));
      onFilesChange([...files, ...newItems]);
    },
    [files, onFilesChange],
  );

  const removeFile = useCallback(
    (id: string) => {
      onFilesChange(files.filter((f) => f.id !== id));
    },
    [files, onFilesChange],
  );

  const formatSize = (bytes: number) =>
    `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 md:p-10 flex flex-col items-center justify-center transition-colors cursor-pointer",
          isDragOver
            ? "border-primary bg-primary-container/10"
            : "border-border hover:bg-surface-container-low",
        )}
      >
        <Input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div className="size-12 md:size-14 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mb-3 md:mb-4">
          <Upload className="size-6 md:size-7" />
        </div>
        <span className="font-heading text-headline-md text-foreground text-center">
          اضغط للرفع أو اسحب الملفات هنا
        </span>
        <span className="font-body text-body-md text-muted-foreground mt-2 text-center">
          {accept.replace(/\./g, "").toUpperCase()} (بحد أقصى {maxSizeMB} ميجابايت للملف)
        </span>
      </div>

      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-card border border-border rounded-lg gap-2"
            >
              <button
                type="button"
                onClick={() => removeFile(item.id)}
                className="text-destructive hover:bg-destructive/10 p-1.5 rounded-full transition-colors shrink-0"
              >
                <Trash2 className="size-4" />
              </button>
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="text-left min-w-0">
                  <p className="font-heading text-label-sm text-foreground truncate">
                    {item.file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(item.file.size)}
                  </p>
                </div>
                <FileText className="size-4 md:size-5 text-primary shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
