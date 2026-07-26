import type { ComplaintCreateFormData } from "@/types/complaint-create.types";
import { FileUploadArea } from "@/components/file-upload-area";

interface FileItem {
  file: File;
  id: string;
}

interface ComplaintAttachmentStepProps {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
}

export function ComplaintAttachmentStep({ files, onFilesChange }: ComplaintAttachmentStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="font-heading text-headline-md text-foreground">
          المرفقات والوثائق
        </p>
        <FileUploadArea
          files={files}
          onFilesChange={onFilesChange}
          accept=".pdf,.jpg,.png,.doc,.docx"
          maxSizeMB={10}
        />
      </div>
    </div>
  );
}
