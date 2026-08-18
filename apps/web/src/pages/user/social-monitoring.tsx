import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { DraftsList } from "@/features/social/drafts-list";
import { DraftsToolbar } from "@/features/social/drafts-toolbar";
import { DraftsEmptyState } from "@/features/social/drafts-empty-state";
import { DraftsListSkeleton } from "@/features/social/drafts-list-skeleton";
import { useSocialDrafts } from "@/features/social/hooks";
import type { SocialDraftStatus } from "@/features/social/types";

export default function UserSocialMonitoring() {
  const [draftStatus, setDraftStatus] = useState<SocialDraftStatus | "">("Pending");

  const {
    data: drafts,
    isLoading,
    isError,
    refetch,
  } = useSocialDrafts(draftStatus || undefined);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="مراقبة وسائل التواصل"
        description="مراجعة المنشورات المُلتقطة من المجموعات على فيسبوك وتحويلها إلى شكاوى"
      />

      <div className="flex flex-col gap-6">
        <DraftsToolbar status={draftStatus} onStatusChange={setDraftStatus} showPoll={false} />

        <AsyncLoader
          loading={isLoading}
          error={isError}
          onRetry={() => refetch()}
          errorText="تعذر تحميل المنشورات"
          skeleton={<DraftsListSkeleton />}
        >
          {drafts && drafts.length > 0 ? (
            <DraftsList drafts={drafts} />
          ) : (
            <DraftsEmptyState showPoll={false} />
          )}
        </AsyncLoader>
      </div>
    </div>
  );
}
