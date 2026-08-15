import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AddGroupDialog } from "@/features/social/add-group-dialog";
import { GroupsList } from "@/features/social/groups-list";
import { GroupsEmptyState } from "@/features/social/groups-empty-state";
import { GroupsListSkeleton } from "@/features/social/groups-list-skeleton";
import { DraftsList } from "@/features/social/drafts-list";
import { DraftsToolbar } from "@/features/social/drafts-toolbar";
import { DateSummaryCard } from "@/features/social/date-summary-card";
import { DraftsEmptyState } from "@/features/social/drafts-empty-state";
import { DraftsListSkeleton } from "@/features/social/drafts-list-skeleton";
import {
  useMonitoredGroups,
  useSocialDrafts,
} from "@/features/social/hooks";
import type { SocialDraftStatus } from "@/features/social/types";

export default function AdminSocialMonitoring() {
  const { data: groups, isLoading, isError, refetch } = useMonitoredGroups();
  const [draftStatus, setDraftStatus] = useState<SocialDraftStatus | "">("Pending");

  const {
    data: drafts,
    isLoading: draftsLoading,
    isError: draftsError,
    refetch: refetchDrafts,
  } = useSocialDrafts(draftStatus || undefined);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="مراقبة وسائل التواصل"
        description="إدارة المجموعات والصفحات المُراقبة على فيسبوك ومراجعة المنشورات المُلتقطة"
      />

      <Tabs defaultValue="drafts">
        <TabsList className="self-start">
          <TabsTrigger value="drafts">منشورات بانتظار المراجعة</TabsTrigger>
          <TabsTrigger value="groups">المجموعات المُراقبة</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="flex flex-col gap-6">
          <div className="flex justify-start">
            <AddGroupDialog />
          </div>

          <AsyncLoader
            loading={isLoading}
            error={isError}
            onRetry={() => refetch()}
            errorText="تعذر تحميل المجموعات المُراقبة"
            skeleton={<GroupsListSkeleton />}
          >
            {groups && groups.length > 0 ? (
              <GroupsList groups={groups} />
            ) : (
              <GroupsEmptyState />
            )}
          </AsyncLoader>
        </TabsContent>

        <TabsContent value="drafts" className="flex flex-col gap-6">
          <DraftsToolbar status={draftStatus} onStatusChange={setDraftStatus} />
          <DateSummaryCard />

          <AsyncLoader
            loading={draftsLoading}
            error={draftsError}
            onRetry={() => refetchDrafts()}
            errorText="تعذر تحميل المنشورات"
            skeleton={<DraftsListSkeleton />}
          >
            {drafts && drafts.length > 0 ? (
              <DraftsList drafts={drafts} />
            ) : (
              <DraftsEmptyState />
            )}
          </AsyncLoader>
        </TabsContent>
      </Tabs>
    </div>
  );
}
