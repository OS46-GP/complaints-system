import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PATHS } from "@/router/paths";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRejectDraft } from "@/features/social/hooks";
import type { SocialDraft } from "@/features/social/types";

interface DraftsListProps {
  drafts: SocialDraft[];
}

const statusLabels: Record<string, string> = {
  Pending: "بانتظار المراجعة",
  Approved: "مُعتمدة",
  Rejected: "مرفوضة",
};

export function DraftsList({ drafts }: DraftsListProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const rejectMutation = useRejectDraft();
  const [draftToReject, setDraftToReject] = useState<SocialDraft | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const handleApprove = (draft: SocialDraft) => {
    const newComplaintPath = pathname.startsWith("/user")
      ? PATHS.USER.NEW_COMPLAINT
      : PATHS.ADMIN.NEW_COMPLAINT;
    navigate(newComplaintPath, { state: { socialDraft: draft } });
  };

  const handleReject = () => {
    if (!draftToReject) return;
    rejectMutation.mutate(
      { id: draftToReject.id, notes: rejectNotes || undefined },
      {
        onSuccess: () => {
          toast.success("تم رفض المنشور");
          setDraftToReject(null);
          setRejectNotes("");
        },
        onError: () => toast.error("تعذر رفض المنشور"),
      },
    );
  };

  return (
    <>
      <ul className="flex flex-col gap-4">
        {drafts.map((draft) => (
          <li
            key={draft.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-surface-container-lowest p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-heading font-semibold text-foreground">
                  {draft.authorName || "مواطن"}
                </span>
                {draft.groupName && (
                  <Badge variant="outline">{draft.groupName}</Badge>
                )}
                <Badge
                  variant={
                    draft.status === "Approved"
                      ? "default"
                      : draft.status === "Rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {statusLabels[draft.status]}
                </Badge>
              </div>
              <a
                href={draft.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-body-sm text-primary hover:underline"
              >
                رابط المنشور
                <ExternalLink className="size-3.5" />
              </a>
            </div>

            <p className="text-body-md text-foreground/90 whitespace-pre-wrap">
              {draft.postText}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-body-sm text-muted-foreground">
                {new Date(draft.postedAt).toLocaleString("ar-EG")}
              </span>

              {draft.status === "Pending" ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleApprove(draft)}
                  >
                    <Check className="size-4" />
                    تحويل لشكوى
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    disabled={rejectMutation.isPending}
                    onClick={() => {
                      setDraftToReject(draft);
                      setRejectNotes("");
                    }}
                  >
                    <X className="size-4" />
                    رفض
                  </Button>
                </div>
              ) : (
                draft.notes && (
                  <p className="text-body-sm text-muted-foreground">
                    السبب: {draft.notes}
                  </p>
                )
              )}
            </div>
          </li>
        ))}
      </ul>

      <Dialog
        open={!!draftToReject}
        onOpenChange={(open) => !open && setDraftToReject(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض المنشور</DialogTitle>
            <DialogDescription>
              اكتب سبب الرفض (اختياري)
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="مثال: منشور ترويجي لا يخص الشكاوى"
            rows={3}
          />

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDraftToReject(null)}
              disabled={rejectMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              className="gap-2"
            >
              {rejectMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <X className="size-4" />
              )}
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
