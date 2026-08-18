import { useFormContext } from "react-hook-form";
import type { ComplaintCreateFormValues } from "@/features/complaint-create/validations";
import { FileUploadArea } from "@/features/complaint-create/file-upload-area";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function ComplaintAttachmentStep() {
  const form = useFormContext<ComplaintCreateFormValues>();

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="files"
        render={({ field }) => (
          <FormItem>
            <FormLabel>المرفقات والوثائق</FormLabel>
            <FileUploadArea
              files={field.value}
              onFilesChange={(files) => field.onChange(files)}
              accept=".pdf,.jpg,.png,.doc,.docx"
              maxSizeMB={10}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
