import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { Upload, FileText, Loader2, ScanLine, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PATHS } from "@/router/paths";
import { axiosClient } from "@/api/axios-client";
import { PageHeader } from "@/components/shared/page-header";
import type { OcrIntakeResult } from "./types";

export function OcrIntakePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const listPath = isAdmin ? PATHS.ADMIN.COMPLAINTS : PATHS.USER.COMPLAINTS;
  const newComplaintPath = isAdmin ? PATHS.ADMIN.NEW_COMPLAINT : PATHS.USER.NEW_COMPLAINT;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axiosClient.post<OcrIntakeResult>("/api/intake/ocr", formData, { timeout: 120000 });
      const data = res.data;

      navigate(newComplaintPath, { state: { ocrData: data.fields } });
    } catch {
      setError("فشلت معالجة الصورة. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/tiff", "image/webp", "image/bmp"];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدخال عبر OCR"
        description="رفع صورة شكوى لاستخراج البيانات تلقائياً"
      >
        <Button variant="outline" className="gap-2" onClick={() => navigate(listPath)}>
          <ArrowRight className="size-4" />
          العودة للقائمة
        </Button>
      </PageHeader>

      <div className="max-w-[600px] w-full mx-auto">
        <div className="bg-card/80 backdrop-blur-lg rounded-xl border border-border p-6 md:p-8 shadow-xs flex flex-col gap-6">
          <label
            className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer hover:bg-surface-container-low"
          >
            <Input
              ref={inputRef}
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
            <div className="size-14 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mb-4">
              <Upload className="size-7" />
            </div>
            <span className="font-heading text-headline-md text-foreground text-center">
              اضغط لرفع صورة الشكوى
            </span>
            <span className="font-body text-body-md text-muted-foreground mt-2 text-center">
              JPG, PNG, TIFF, WEBP, BMP
            </span>
          </label>

          {file && (
            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 text-primary shrink-0" />
                <span className="font-heading text-label-sm text-foreground truncate">
                  {file.name}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive shrink-0"
                onClick={() => setFile(null)}
                disabled={loading}
              >
                حذف
              </Button>
            </div>
          )}

          {error && (
            <p className="text-destructive text-label-sm px-1">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 gap-2"
              size="lg"
              onClick={handleSubmit}
              disabled={!file || loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ScanLine className="size-4" />
              )}
              {loading ? "جارٍ المعالجة..." : "بدء المعالجة"}
            </Button>
            <Button variant="outline" className="flex-1" size="lg" onClick={() => navigate(listPath)} disabled={loading}>
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
